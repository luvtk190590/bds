"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUserId) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", authUserId)
            .single();
        setProfile(data);
    };

    const signUp = async ({ email, password, fullName, role = "buyer" }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
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
