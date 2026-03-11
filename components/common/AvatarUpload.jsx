"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadImageAsWebP } from "@/lib/utils/imageUpload";
import toast from "react-hot-toast";

export default function AvatarUpload({ userId, currentUrl, onUploaded, size = 100 }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || "/images/avatar/account.jpg");
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const publicUrl = await uploadImageAsWebP(file, supabase, "avatars", userId, 400, 0.85);

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
      if (dbErr) throw dbErr;

      URL.revokeObjectURL(objectUrl);
      setPreview(publicUrl);
      toast.success("Đã cập nhật ảnh đại diện!");
      onUploaded?.(publicUrl);
    } catch (err) {
      toast.error("Lỗi upload: " + err.message);
      setPreview(currentUrl || "/images/avatar/account.jpg");
      URL.revokeObjectURL(objectUrl);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="avatar-upload-wrap">
      <div className="avatar-img-wrap" style={{ width: size, height: size, position: "relative" }}>
        <Image
          src={preview}
          alt="avatar"
          width={size}
          height={size}
          style={{ borderRadius: "50%", objectFit: "cover", width: size, height: size }}
          key={preview}
        />
        {uploading && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12,
          }}>
            Đang tải...
          </div>
        )}
      </div>
      <div className="content uploadfile" style={{ marginLeft: 16 }}>
        <p style={{ marginBottom: 6, fontWeight: 500 }}>Ảnh đại diện</p>
        <button
          type="button"
          className="tf-btn primary"
          style={{ fontSize: 13, padding: "6px 14px" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Đang xử lý..." : "Chọn ảnh"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
          Tự động chuyển sang WebP · Tối đa 20MB
        </p>
      </div>
    </div>
  );
}
