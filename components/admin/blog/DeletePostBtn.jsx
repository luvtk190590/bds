"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function DeletePostBtn({ postId, postTitle, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast.error("Lỗi khi xóa bài viết");
    } else {
      toast.success("Đã xóa bài viết");
      onDeleted?.();
    }
    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        <button
          className="admin-btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={loading}
          title="Xác nhận xóa"
        >
          {loading ? "..." : "Xóa?"}
        </button>
        <button
          className="admin-btn btn-ghost btn-sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >Hủy</button>
      </div>
    );
  }

  return (
    <button
      className="admin-btn btn-ghost btn-sm"
      onClick={() => setConfirming(true)}
      style={{ color: "#ef4444" }}
      title={`Xóa: ${postTitle}`}
    >
      Xóa
    </button>
  );
}
