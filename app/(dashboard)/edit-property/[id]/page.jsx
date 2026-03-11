"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import PropertyForm from "@/components/property/PropertyForm";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import Header2 from "@/components/headers/Header2";
import toast from "react-hot-toast";

export default function EditPropertyPage() {
    const { id } = useParams();
    const { profile, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.replace("/?login=1"); return; }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        if (!id || !profile?.id) return;
        supabase
            .from("properties")
            .select(`*, images:property_images(id, url, is_primary, sort_order)`)
            .eq("id", id)
            .eq("owner_id", profile.id) // chỉ chủ sở hữu mới sửa được
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    toast.error("Không tìm thấy tin đăng hoặc bạn không có quyền chỉnh sửa");
                    router.replace("/my-property");
                    return;
                }
                setProperty(data);
                setLoading(false);
            });
    }, [id, profile?.id]);

    if (authLoading || loading) {
        return (
            <div className="layout-wrap">
                <Header2 />
                <SidebarMenu />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <p style={{ color: "#94a3b8" }}>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrap">
            <Header2 />
            <SidebarMenu />
            <PropertyForm
                initialData={property}
                onSuccess={() => router.push("/my-property")}
            />
            <div className="overlay-dashboard" />
        </div>
    );
}
