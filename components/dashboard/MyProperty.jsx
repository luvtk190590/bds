"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatters";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

const STATUS_LABELS = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    sold: "Đã bán",
};

const STATUS_COLORS = {
    pending: { bg: "#fef9c3", color: "#854d0e" },
    approved: { bg: "#dcfce7", color: "#166534" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
    sold: { bg: "#e0e7ff", color: "#3730a3" },
};

export default function MyProperty() {
    const { profile, loading: authLoading } = useAuth();
    const supabase = createClient();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQ, setSearchQ] = useState("");

    const load = useCallback(async () => {
        if (!profile?.id) {
            // Auth đã xong nhưng không có profile → không cần load, bỏ loading
            if (!authLoading) setLoading(false);
            return;
        }
        setLoading(true);
        let query = supabase
            .from("properties")
            .select(`
                id, title, price, area, listing_type, approval_status, created_at, slug,
                property_images ( url, is_primary, sort_order )
            `)
            .eq("owner_id", profile.id)
            .order("created_at", { ascending: false });

        if (statusFilter !== "all") query = query.eq("approval_status", statusFilter);
        if (searchQ.trim()) query = query.ilike("title", `%${searchQ.trim()}%`);

        const { data, error } = await query;
        if (error) toast.error("Lỗi tải dữ liệu: " + error.message);
        setProperties(data || []);
        setLoading(false);
    }, [profile?.id, authLoading, statusFilter, searchQ]);

    useEffect(() => { load(); }, [load]);

    async function markSold(id) {
        if (!confirm("Đánh dấu tin này là đã bán?")) return;
        const { error } = await supabase.from("properties")
            .update({ approval_status: "sold" })
            .eq("id", id);
        if (error) toast.error("Lỗi: " + error.message);
        else { toast.success("Đã đánh dấu là đã bán"); load(); }
    }

    async function deleteProperty(id) {
        if (!confirm("Xóa tin đăng này? Không thể hoàn tác.")) return;
        const { error } = await supabase.from("properties").delete().eq("id", id);
        if (error) toast.error("Lỗi: " + error.message);
        else { toast.success("Đã xóa tin đăng"); load(); }
    }

    return (
        <div className="main-content">
            <div className="main-content-inner wrap-dashboard-content">
                <div className="button-show-hide show-mb">
                    <span className="body-1">Hiện Dashboard</span>
                </div>

                {/* Filters */}
                <div className="row mb-3">
                    <div className="col-md-3">
                        <fieldset className="box-fieldset">
                            <label>Trạng thái:</label>
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                                <option value="sold">Đã bán</option>
                            </select>
                        </fieldset>
                    </div>
                    <div className="col-md-9">
                        <fieldset className="box-fieldset">
                            <label>Tìm kiếm:</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo tiêu đề..."
                                value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") load(); }}
                            />
                        </fieldset>
                    </div>
                </div>

                <div className="widget-box-2 wd-listing">
                    <h5 className="title">Tin đăng của tôi</h5>

                    {loading ? (
                        <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
                    ) : properties.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Chưa có tin đăng nào</div>
                            <Link href="/add-property" className="tf-btn primary" style={{ display: "inline-block", marginTop: 8 }}>
                                Đăng tin ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="wrap-table">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tin đăng</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {properties.map(p => {
                                            const imgs = p.property_images?.sort((a, b) =>
                                                (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order
                                            );
                                            const imgSrc = imgs?.[0]?.url || "/images/home/house-1.jpg";
                                            const status = p.approval_status || "pending";
                                            const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.pending;

                                            return (
                                                <tr key={p.id} className="file-delete">
                                                    <td>
                                                        <div className="listing-box">
                                                            <div className="images" style={{ width: 120, height: 80, position: "relative", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                                                                <Image
                                                                    alt={p.title}
                                                                    src={imgSrc}
                                                                    fill
                                                                    style={{ objectFit: "cover" }}
                                                                />
                                                            </div>
                                                            <div className="content">
                                                                <div className="title">
                                                                    {p.slug && status === "approved" ? (
                                                                        <Link href={`/property-details/${p.slug}`} className="link">
                                                                            {p.title}
                                                                        </Link>
                                                                    ) : (
                                                                        <span>{p.title}</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-date" style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                                                    Ngày đăng: {new Date(p.created_at).toLocaleDateString("vi-VN")}
                                                                </div>
                                                                <div className="text-btn text-primary" style={{ marginTop: 4, fontWeight: 600 }}>
                                                                    {formatPrice(p.price)}
                                                                    {p.area ? ` · ${p.area}m²` : ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="status-wrap">
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    padding: "4px 12px",
                                                                    borderRadius: 20,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    background: statusStyle.bg,
                                                                    color: statusStyle.color,
                                                                }}
                                                            >
                                                                {STATUS_LABELS[status] || status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <ul className="list-action" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                            <li>
                                                                <Link href={`/edit-property/${p.id}`} className="item" title="Chỉnh sửa">
                                                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                                                        <path d="M11.2413 2.9915L12.366 1.86616C12.6005 1.63171 12.9184 1.5 13.25 1.5C13.5816 1.5 13.8995 1.63171 14.134 1.86616C14.3685 2.10062 14.5002 2.4186 14.5002 2.75016C14.5002 3.08173 14.3685 3.39971 14.134 3.63416L4.55467 13.2135C4.20222 13.5657 3.76758 13.8246 3.29 13.9668L1.5 14.5002L2.03333 12.7102C2.17552 12.2326 2.43442 11.7979 2.78667 11.4455L11.242 2.9915H11.2413ZM11.2413 2.9915L13 4.75016" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    Sửa
                                                                </Link>
                                                            </li>
                                                            {status !== "sold" && (
                                                                <li>
                                                                    <a className="item" style={{ cursor: "pointer" }} onClick={() => markSold(p.id)} title="Đánh dấu đã bán">
                                                                        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                                                            <path d="M12.2427 12.2427C13.3679 11.1175 14.0001 9.59135 14.0001 8.00004C14.0001 6.40873 13.3679 4.8826 12.2427 3.75737C11.1175 2.63214 9.59135 2 8.00004 2C6.40873 2 4.8826 2.63214 3.75737 3.75737M12.2427 12.2427C11.1175 13.3679 9.59135 14.0001 8.00004 14.0001C6.40873 14.0001 4.8826 13.3679 3.75737 12.2427C2.63214 11.1175 2 9.59135 2 8.00004C2 6.40873 2.63214 4.8826 3.75737 3.75737M12.2427 12.2427L3.75737 3.75737" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                        Đã bán
                                                                    </a>
                                                                </li>
                                                            )}
                                                            <li>
                                                                <a className="remove-file item" style={{ cursor: "pointer" }} onClick={() => deleteProperty(p.id)} title="Xóa">
                                                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                                                        <path d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    Xóa
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="footer-dashboard">
                <p>Copyright © 2024 Home Lengo</p>
            </div>
        </div>
    );
}
