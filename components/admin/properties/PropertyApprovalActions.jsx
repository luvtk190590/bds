"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function PropertyApprovalActions({ property, onDone, onClose }) {
  const [note, setNote] = useState(property?.approval_note || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function approve() {
    setLoading(true);
    const { error } = await supabase.from("properties").update({
      approval_status: "approved",
      approval_note: note || null,
      approved_at: new Date().toISOString(),
    }).eq("id", property.id);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success("Tin đăng đã được duyệt!"); onDone(); }
    setLoading(false);
  }

  async function reject() {
    if (!note.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    setLoading(true);
    const { error } = await supabase.from("properties").update({
      approval_status: "rejected",
      approval_note: note,
      approved_at: new Date().toISOString(),
    }).eq("id", property.id);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success("Đã từ chối tin đăng"); onDone(); }
    setLoading(false);
  }

  return (
    <div className="admin-card" style={{ position: "sticky", top: 80 }}>
      <div className="admin-card-header">
        <h6>Xét duyệt tin đăng</h6>
        <button className="admin-btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div className="admin-card-body">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{property.title}</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {property.listing_type === "rent" ? "Cho thuê" : "Bán"} ·
            {property.profiles && ` Bởi: ${property.profiles.full_name || property.profiles.email}`}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Trạng thái hiện tại
          </div>
          <span className={`admin-badge badge-${property.approval_status || "pending"}`}>
            {{ pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[property.approval_status] || "Chờ duyệt"}
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Ghi chú / Lý do từ chối
          </label>
          <textarea
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              resize: "vertical",
              minHeight: 80,
              outline: "none",
              fontFamily: "inherit",
            }}
            placeholder="Ghi chú cho người đăng (bắt buộc khi từ chối)..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="admin-btn btn-success" onClick={approve} disabled={loading}>
            <i className="icon icon-check-circle" /> Duyệt tin
          </button>
          <button className="admin-btn btn-danger" onClick={reject} disabled={loading}>
            <i className="icon icon-close" /> Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
