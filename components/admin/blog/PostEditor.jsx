"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import SeoPanel from "./SeoPanel";
import RichEditor from "@/components/common/RichEditor";
import { uploadImageAsWebP } from "@/lib/utils/imageUpload";

const CATEGORIES = ["Tin tức", "Thị trường", "Kinh nghiệm mua nhà", "Pháp lý BDS", "Phong thủy", "Thiết kế nội thất", "Đầu tư BDS"];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function countWords(html) {
  if (!html) return 0;
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(html) {
  return Math.ceil(countWords(html) / 200) || 1;
}

export default function PostEditor({ initialPost }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialPost?.id;
  const coverInputRef = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugManual, setSlugManual] = useState(!!initialPost?.slug);
  const [category, setCategory] = useState(initialPost?.category || "");
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [imageUrl, setImageUrl] = useState(initialPost?.image_url || "");
  const [description, setDescription] = useState(initialPost?.description || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [tags, setTags] = useState(initialPost?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [seoForm, setSeoForm] = useState({
    focusKeyword: initialPost?.focus_keyword || "",
    seoTitle: initialPost?.seo_title || "",
    seoDescription: initialPost?.seo_description || "",
    seoKeywords: initialPost?.seo_keywords || "",
    canonicalUrl: initialPost?.canonical_url || "",
    noIndex: initialPost?.no_index || false,
    ogTitle: initialPost?.og_title || "",
    ogDescription: initialPost?.og_description || "",
    ogImage: initialPost?.og_image || "",
  });

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCoverUploading(true);
    try {
      const publicUrl = await uploadImageAsWebP(file, supabase, "blog-images", "covers", 1600, 0.85);
      setImageUrl(publicUrl);
      toast.success("Đã upload ảnh bìa!");
    } catch (err) {
      toast.error("Lỗi upload: " + err.message);
    }
    setCoverUploading(false);
  }

  function addTag(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !tags.includes(tag)) setTags(t => [...t, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setTags(t => t.filter(x => x !== tag));
  }

  async function save(overrideStatus) {
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    if (!slug.trim()) { toast.error("Vui lòng nhập slug"); return; }

    setSaving(true);
    const finalContent = content;
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      content: finalContent,
      category: category || null,
      image_url: imageUrl.trim() || null,
      status: overrideStatus || status,
      tags: tags.length ? tags : null,
      reading_time: readingTime(finalContent),
      // SEO
      focus_keyword: seoForm.focusKeyword || null,
      seo_title: seoForm.seoTitle || null,
      seo_description: seoForm.seoDescription || null,
      seo_keywords: seoForm.seoKeywords || null,
      canonical_url: seoForm.canonicalUrl || null,
      no_index: seoForm.noIndex || false,
      og_title: seoForm.ogTitle || null,
      og_description: seoForm.ogDescription || null,
      og_image: seoForm.ogImage || null,
      updated_at: new Date().toISOString(),
    };

    if (!isEdit) {
      payload.published_at = overrideStatus === "published" || status === "published"
        ? new Date().toISOString()
        : null;
    }

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("posts").update(payload).eq("id", initialPost.id));
    } else {
      ({ error } = await supabase.from("posts").insert(payload));
    }

    if (error) {
      toast.error("Lỗi lưu bài: " + error.message);
    } else {
      toast.success(isEdit ? "Đã cập nhật bài viết!" : "Đã tạo bài viết!");
      if (!isEdit) router.push("/admin/blog");
    }
    setSaving(false);
  }

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <button onClick={() => router.push("/admin/blog")} className="admin-back-link" style={{ border: "none", background: "none", cursor: "pointer" }}>
            <i className="icon icon-arrow-left2" /> Quay lại danh sách
          </button>
          <h4 style={{ marginTop: 8 }}>{isEdit ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h4>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="admin-btn btn-outline" onClick={() => save("draft")} disabled={saving}>
            Lưu nháp
          </button>
          <button className="admin-btn btn-primary" onClick={() => save("published")} disabled={saving}>
            <i className="icon icon-send" /> {saving ? "Đang lưu..." : "Đăng bài"}
          </button>
        </div>
      </div>

      <div className="admin-editor-layout">
        {/* Main editor */}
        <div className="admin-editor-main">
          <div className="admin-card">
            <div className="admin-card-body">
              {/* Title */}
              <input
                type="text"
                className="editor-title-input"
                placeholder="Tiêu đề bài viết..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              {/* Slug */}
              <div className="editor-slug-row" style={{ marginTop: 8, marginBottom: 16 }}>
                <span className="slug-prefix">URL:</span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>/blogs/</span>
                <input
                  type="text"
                  className="slug-input"
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                  placeholder="url-slug"
                />
                {slugManual && (
                  <button
                    style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => { setSlug(slugify(title)); setSlugManual(false); }}
                    title="Tự động từ tiêu đề"
                  >↺ Auto</button>
                )}
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label>Mô tả ngắn (excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Tóm tắt ngắn gọn về bài viết..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* TipTap Editor */}
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Bắt đầu viết nội dung bài viết tại đây..."
                minHeight={400}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                <span>{countWords(content)} từ</span>
                <span>~{readingTime(content)} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="admin-card">
            <div className="admin-card-header"><h6>Ảnh bìa bài viết</h6></div>
            <div className="admin-card-body">
              {imageUrl ? (
                <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                  <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
                  >
                    ✕ Xóa ảnh
                  </button>
                </div>
              ) : (
                <div
                  style={{ border: "2px dashed #e2e8f0", borderRadius: 8, padding: "32px 16px", textAlign: "center", color: "#94a3b8", marginBottom: 10, cursor: "pointer" }}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 13 }}>Nhấn để chọn ảnh bìa</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Tự động chuyển sang WebP</div>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                className="admin-btn btn-outline btn-sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                style={{ width: "100%" }}
              >
                {coverUploading ? "Đang upload..." : imageUrl ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: publish + SEO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Publish settings */}
          <div className="admin-card">
            <div className="admin-card-header"><h6>Xuất bản</h6></div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label>Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="draft">Nháp</option>
                  <option value="published">Đã đăng</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label>Danh mục</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label>Tags</label>
                <div className="admin-tags-input">
                  {tags.map(t => (
                    <span key={t} className="tag-chip">
                      {t}
                      <button className="chip-remove" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Nhập tag, nhấn Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="admin-btn btn-outline" style={{ flex: 1 }} onClick={() => save("draft")} disabled={saving}>
                  Lưu nháp
                </button>
                <button className="admin-btn btn-primary" style={{ flex: 1 }} onClick={() => save("published")} disabled={saving}>
                  {saving ? "..." : "Đăng"}
                </button>
              </div>
            </div>
          </div>

          {/* SEO Panel */}
          <SeoPanel
            form={seoForm}
            setForm={setSeoForm}
            title={title}
            slug={slug}
            content={content}
          />
        </div>
      </div>
    </div>
  );
}
