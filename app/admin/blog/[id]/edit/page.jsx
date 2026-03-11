"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PostEditor from "@/components/admin/blog/PostEditor";

export default function EditPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="admin-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <p style={{ color: "#94a3b8" }}>Đang tải bài viết...</p>
    </div>
  );

  if (!post) return (
    <div className="admin-content">
      <p style={{ color: "#ef4444" }}>Không tìm thấy bài viết.</p>
    </div>
  );

  return <PostEditor initialPost={post} />;
}
