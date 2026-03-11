"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({});

// Module-level singleton: chỉ có 1 subscription auth tại 1 thời điểm
// Tránh React StrictMode double-mount tạo 2 subscription tranh Web Lock → AbortError
let _authSubscription = null;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const realtimeChannelRef = useRef(null);

    useEffect(() => {
        // Nếu đã có subscription (StrictMode double-mount), không tạo thêm
        if (_authSubscription) return;

        let destroyed = false;

        function subscribeProfile(userId) {
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
                realtimeChannelRef.current = null;
            }
            const channelName = `profile-rt-${userId}-${Date.now()}`;
            realtimeChannelRef.current = supabase
                .channel(channelName)
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                }, (payload) => {
                    if (!destroyed && payload.new?.auth_user_id === userId) {
                        setProfile(payload.new);
                    }
                })
                .subscribe();
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (destroyed) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
                if (!destroyed) subscribeProfile(session.user.id);
            } else {
                setProfile(null);
                if (realtimeChannelRef.current) {
                    supabase.removeChannel(realtimeChannelRef.current);
                    realtimeChannelRef.current = null;
                }
            }
            if (!destroyed) setLoading(false);
        });

        _authSubscription = subscription;

        return () => {
            destroyed = true;
            subscription.unsubscribe();
            _authSubscription = null;
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
                realtimeChannelRef.current = null;
            }
        };
    }, []);

    const fetchProfile = async (authUserId) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", authUserId)
            .single();
        // Không ghi đè profile = null nếu query lỗi (tránh làm mất profile khi mạng chập choạn)
        if (!error) setProfile(data);
    };

    const signUp = async ({ email, password, fullName, role = "buyer" }) => {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: fullName,
                    role,
                },
            },
        });
        return { data, error };
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
            setProfile(null);
        }
        return { error };
    };

    const updateProfile = async (updates) => {
        if (!profile) return { error: { message: "No profile found" } };

        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", profile.id)
            .select()
            .single();

        if (data) setProfile(data);
        return { data, error };
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: profile?.role === "admin",
        isSeller: profile?.role === "seller",
        isBroker: profile?.role === "broker",
        isBuyer: profile?.role === "buyer",
        canPostProperty:
            profile?.role === "seller" || profile?.role === "broker",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
