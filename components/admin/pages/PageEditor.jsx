"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichEditor from "@/components/common/RichEditor";
import toast from "react-hot-toast";

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function wordCount(html) {
  return (html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

export default function PageEditor({ initialPage = null }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialPage?.id;

  const [title,       setTitle]       = useState(initialPage?.title        || "");
  const [slug,        setSlug]        = useState(initialPage?.slug         || "");
  const [content,     setContent]     = useState(initialPage?.content      || "");
  const [excerpt,     setExcerpt]     = useState(initialPage?.excerpt      || "");
  const [metaTitle,   setMetaTitle]   = useState(initialPage?.meta_title   || "");
  const [metaDesc,    setMetaDesc]    = useState(initialPage?.meta_description || "");
  const [status,      setStatus]      = useState(initialPage?.status       || "published");
  const [template,    setTemplate]    = useState(initialPage?.template     || "default");
  const [slugEdited,  setSlugEdited]  = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("content"); // content | seo | settings

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && title) setSlug(toSlug(title));
  }, [title, slugEdited]);

  const handleSave = useCallback(async (targetStatus = status) => {
    if (!title.trim()) return toast.error("Nhập tiêu đề trang");
    if (!slug.trim())  return toast.error("Nhập slug");
    setSaving(true);

    const payload = {
      title:            title.trim(),
      slug:             slug.trim(),
      content,
      excerpt:          excerpt.trim(),
      meta_title:       metaTitle.trim() || title.trim(),
      meta_description: metaDesc.trim(),
      status:           targetStatus,
      template,
      updated_at:       new Date().toISOString(),
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("site_pages").update(payload).eq("id", initialPage.id));
    } else {
      ({ error } = await supabase.from("site_pages").insert({ ...payload, sort_order: 99 }));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(targetStatus === "published" ? "Đã xuất bản trang" : "Đã lưu bản nháp");
      router.push("/admin/pages");
    }
    setSaving(false);
  }, [title, slug, content, excerpt, metaTitle, metaDesc, status, template, isEdit, initialPage]);

  const wc = wordCount(content);

  return (
    <div className="page-editor-wrap">
      {/* ── Top bar ── */}
      <div className="page-editor-topbar">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => router.push("/admin/pages")}>
            ← Quay lại
          </button>
          <h5 className="mb-0">{isEdit ? `Sửa: ${initialPage.title}` : "Trang mới"}</h5>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu nháp"}
          </button>
          {isEdit && status === "published" && (
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              Xem trang ↗
            </a>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSave("published")}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Xuất bản"}
          </button>
        </div>
      </div>

      <div className="page-editor-body">
        {/* ── Main column ── */}
        <div className="page-editor-main">
          {/* Title */}
          <input
            className="page-title-input"
            placeholder="Tiêu đề trang..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Slug bar */}
          <div className="page-slug-bar">
            <span className="text-muted">URL: /p/</span>
            <input
              className="page-slug-input"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="slug-trang"
            />
            {slugEdited && (
              <button
                className="btn btn-xs btn-outline-secondary"
                onClick={() => { setSlug(toSlug(title)); setSlugEdited(false); }}
              >↺ Reset</button>
            )}
          </div>

          {/* Tabs */}
          <div className="page-editor-tabs">
            {[
              { key: "content",  label: "Nội dung" },
              { key: "excerpt",  label: "Tóm tắt" },
              { key: "seo",      label: "SEO" },
            ].map(t => (
              <button
                key={t.key}
                className={`page-editor-tab${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >{t.label}</button>
            ))}
            <span className="ms-auto text-muted small align-self-center">
              {wc} từ
            </span>
          </div>

          {activeTab === "content" && (
            <div className="page-content-editor">
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Nhập nội dung trang..."
                minHeight={400}
                bucket="site-assets"
                uploadFolder="pages"
              />
            </div>
          )}

          {activeTab === "excerpt" && (
            <div className="p-3">
              <label className="form-label fw-6">Mô tả ngắn / Trích dẫn</label>
              <textarea
                className="form-control"
                rows={5}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Mô tả ngắn hiển thị khi chia sẻ hoặc trong danh sách trang..."
                maxLength={300}
              />
              <div className="form-text">{excerpt.length}/300 ký tự</div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="p-3">
              <div className="mb-4">
                <label className="form-label fw-6">Meta Title</label>
                <input
                  className="form-control"
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  placeholder={title || "Tiêu đề SEO..."}
                  maxLength={70}
                />
                <div className="form-text d-flex justify-content-between">
                  <span>Để trống sẽ dùng tiêu đề trang. Khuyến nghị: 50–60 ký tự.</span>
                  <span className={(metaTitle || title).length > 60 ? "text-warning" : "text-success"}>
                    {(metaTitle || title).length}/70
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-6">Meta Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  placeholder="Mô tả hiển thị trên Google..."
                  maxLength={160}
                />
                <div className="form-text d-flex justify-content-between">
                  <span>Khuyến nghị: 120–155 ký tự.</span>
                  <span className={metaDesc.length > 155 ? "text-warning" : "text-success"}>
                    {metaDesc.length}/160
                  </span>
                </div>
              </div>

              {/* SERP Preview */}
              {(metaTitle || title) && (
                <div className="serp-preview">
                  <div className="serp-title">{metaTitle || title}</div>
                  <div className="serp-url">homelengo.vn › p › {slug}</div>
                  <div className="serp-description">{metaDesc || excerpt || "Không có mô tả"}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="page-editor-sidebar">
          {/* Status */}
          <div className="admin-card mb-3">
            <div className="admin-card-header"><h6 className="mb-0">Xuất bản</h6></div>
            <div className="admin-card-body">
              <div className="mb-3">
                <label className="form-label small fw-6">Trạng thái</label>
                <select
                  className="form-select form-select-sm"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="published">Xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-6">Template</label>
                <select
                  className="form-select form-select-sm"
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                >
                  <option value="default">Mặc định</option>
                  <option value="full-width">Full width</option>
                  <option value="sidebar">Có sidebar</option>
                  <option value="blank">Blank (chỉ nội dung)</option>
                </select>
              </div>
              <button
                className="btn btn-primary btn-sm w-100 mb-2"
                onClick={() => handleSave("published")}
                disabled={saving}
              >
                {isEdit ? "Cập nhật" : "Xuất bản"}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => handleSave("draft")}
                disabled={saving}
              >
                Lưu nháp
              </button>
            </div>
          </div>

          {/* Info */}
          {isEdit && (
            <div className="admin-card">
              <div className="admin-card-header"><h6 className="mb-0">Thông tin</h6></div>
              <div className="admin-card-body" style={{ fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Slug:</span>
                  <code className="text-primary">{slug}</code>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Số từ:</span>
                  <span>{wc}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Cập nhật:</span>
                  <span>{initialPage?.updated_at ? new Date(initialPage.updated_at).toLocaleDateString("vi-VN") : "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
