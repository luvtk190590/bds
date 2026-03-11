"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const ROLE_LABELS = { broker: "Môi giới", seller: "Người bán", buyer: "Người mua" };
const REQUIRE_DOC = { broker: "certificate_url", seller: "property_doc_url" };

export default function VerificationActions({ user, verRequest, onRefresh }) {
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const vstatus = user?.verification_status || "unverified";
  const canReview = verRequest && verRequest.status === "pending";

  async function approve() {
    setLoading(true);
    try {
      if (verRequest) {
        const { error: e1 } = await supabase.from("verification_requests").update({
          status: "approved",
          admin_note: adminNote || null,
          reviewed_at: new Date().toISOString(),
        }).eq("id", verRequest.id);
        if (e1) throw e1;
      }
      const { error: e2 } = await supabase.from("profiles").update({
        verification_status: "verified",
        admin_note: adminNote || null,
        verified_notified: false,
        rejection_notified: false,
      }).eq("id", user.id);
      if (e2) throw e2;
      toast.success("Đã xác minh tài khoản!");
      setAdminNote("");
      onRefresh();
    } catch (err) {
      toast.error("Lỗi: " + (err.message || JSON.stringify(err)));
    }
    setLoading(false);
  }

  async function reject() {
    if (!adminNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setLoading(true);
    try {
      if (verRequest) {
        const { error: e1 } = await supabase.from("verification_requests").update({
          status: "rejected",
          admin_note: adminNote,
          reviewed_at: new Date().toISOString(),
        }).eq("id", verRequest.id);
        if (e1) throw e1;
      }
      const { error: e2 } = await supabase.from("profiles").update({
        verification_status: "rejected",
        admin_note: adminNote,
        rejection_notified: false,
        verified_notified: false,
      }).eq("id", user.id);
      if (e2) throw e2;
      toast.success("Đã từ chối xác minh");
      setAdminNote("");
      onRefresh();
    } catch (err) {
      toast.error("Lỗi: " + (err.message || JSON.stringify(err)));
    }
    setLoading(false);
  }

  async function resetToUnverified() {
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        verification_status: "unverified",
        admin_note: null,
      }).eq("id", user.id);
      if (error) throw error;
      toast.success("Đã reset trạng thái xác minh");
      onRefresh();
    } catch (err) {
      toast.error("Lỗi: " + (err.message || JSON.stringify(err)));
    }
    setLoading(false);
  }

  const docKey = REQUIRE_DOC[user?.role];
  const docUrl = verRequest?.[docKey];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Current status card */}
      <div className="verification-action-card">
        <div className="va-header">Trạng thái xác minh</div>
        <div className="va-body">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Vai trò: <strong>{ROLE_LABELS[user?.role] || user?.role}</strong>
            </div>
            {vstatus === "unverified" && (
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#64748b" }}>
                Người dùng chưa gửi yêu cầu xác minh
              </div>
            )}
            {vstatus === "pending" && (
              <div style={{ padding: "10px 14px", background: "#fef9c3", borderRadius: 8, fontSize: 13, color: "#854d0e" }}>
                Đang chờ admin xem xét
              </div>
            )}
            {vstatus === "verified" && (
              <div style={{ padding: "10px 14px", background: "#dcfce7", borderRadius: 8, fontSize: 13, color: "#166534" }}>
                Tài khoản đã được xác minh ✓
              </div>
            )}
            {vstatus === "rejected" && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
                Yêu cầu xác minh đã bị từ chối
              </div>
            )}
          </div>

          {vstatus === "verified" && (
            <button className="admin-btn btn-outline btn-sm" onClick={resetToUnverified} disabled={loading}>
              Hủy xác minh
            </button>
          )}
        </div>
      </div>

      {/* Verification request detail */}
      {verRequest && (
        <div className="verification-action-card">
          <div className="va-header">Yêu cầu xác minh</div>
          <div className="va-body">
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              Gửi lúc: {new Date(verRequest.created_at).toLocaleDateString("vi-VN")}
            </div>

            {/* Role-specific requirements */}
            {user?.role === "buyer" && (
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                <i className="icon icon-check-circle" style={{ color: "#22c55e", marginRight: 6 }} />
                Người mua — Xác nhận email
                {verRequest.email_confirmed ? " ✓" : " (chưa xác nhận)"}
              </div>
            )}

            {docUrl && (
              <a href={docUrl} target="_blank" rel="noopener noreferrer" className="va-doc-link">
                <i className="icon icon-download" />
                {user?.role === "broker" ? "Xem chứng chỉ môi giới" : "Xem giấy tờ BDS"}
              </a>
            )}

            {verRequest.note && (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#475569", marginBottom: 12 }}>
                <strong>Ghi chú từ người dùng:</strong><br />
                {verRequest.note}
              </div>
            )}

            {verRequest.admin_note && (
              <div style={{ background: "#fef9c3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#854d0e", marginBottom: 12 }}>
                <strong>Ghi chú admin:</strong><br />
                {verRequest.admin_note}
              </div>
            )}

            {/* Review actions */}
            {canReview && (
              <>
                <textarea
                  className="va-note-input"
                  placeholder="Ghi chú admin (bắt buộc khi từ chối)..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                <div className="va-actions">
                  <button className="admin-btn btn-success" onClick={approve} disabled={loading}>
                    <i className="icon icon-check-circle" /> Xác minh
                  </button>
                  <button className="admin-btn btn-danger" onClick={reject} disabled={loading}>
                    <i className="icon icon-close" /> Từ chối
                  </button>
                </div>
              </>
            )}

            {!canReview && vstatus === "unverified" && (
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Chưa có yêu cầu xác minh đang chờ</div>
            )}
          </div>
        </div>
      )}

      {/* Manual override */}
      {!verRequest && vstatus === "unverified" && user?.role !== "buyer" && (
        <div className="verification-action-card">
          <div className="va-header">Xác minh thủ công</div>
          <div className="va-body">
            <textarea
              className="va-note-input"
              placeholder="Ghi chú admin..."
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
            />
            <div className="va-actions">
              <button className="admin-btn btn-success" onClick={approve} disabled={loading}>
                <i className="icon icon-check-circle" /> Xác minh thủ công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
