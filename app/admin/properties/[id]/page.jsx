"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PropertyForm from "@/components/property/PropertyForm";
import PropertyApprovalActions from "@/components/admin/properties/PropertyApprovalActions";
import toast from "react-hot-toast";

export default function AdminPropertyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        const { data, error } = await supabase
            .from("properties")
            .select(`
                *,
                images:property_images(id, url, is_primary, sort_order),
                profiles:owner_id(full_name, email)
            `)
            .eq("id", id)
            .single();

        if (error || !data) {
            toast.error("Không tìm thấy tin đăng");
            router.replace("/admin/properties");
            return;
        }
        setProperty(data);
        setLoading(false);
    }

    useEffect(() => { if (id) load(); }, [id]);

    if (loading) {
        return (
            <div className="admin-content">
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="admin-content">
            <div className="admin-page-header">
                <div>
                    <button
                        className="admin-btn btn-ghost btn-sm"
                        onClick={() => router.push("/admin/properties")}
                        style={{ marginBottom: 8 }}
                    >
                        ← Quay lại danh sách
                    </button>
                    <h4>Chi tiết tin đăng</h4>
                    <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                        Đăng bởi: <strong>{property.profiles?.full_name || property.profiles?.email}</strong>
                        {" · "}
                        <span className={`admin-badge badge-${property.approval_status || "pending"}`}>
                            {{ pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[property.approval_status] || "Chờ duyệt"}
                        </span>
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
                {/* Form chỉnh sửa */}
                <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
                    <PropertyForm
                        initialData={property}
                        adminMode={true}
                        onSuccess={() => { load(); toast.success("Đã cập nhật tin đăng"); }}
                    />
                </div>

                {/* Panel xét duyệt */}
                <PropertyApprovalActions
                    property={property}
                    onDone={() => load()}
                    onClose={() => router.push("/admin/properties")}
                />
            </div>
        </div>
    );
}
