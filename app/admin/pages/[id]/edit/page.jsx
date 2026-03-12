"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageEditor from "@/components/admin/pages/PageEditor";

export default function EditPagePage() {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("site_pages")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setPg(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="admin-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <p style={{ color: "#94a3b8" }}>Đang tải trang...</p>
    </div>
  );

  if (!pg) return (
    <div className="admin-content">
      <p style={{ color: "#ef4444" }}>Không tìm thấy trang.</p>
    </div>
  );

  return <PageEditor initialPage={pg} />;
}
