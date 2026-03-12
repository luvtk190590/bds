"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

const PAGE_SIZE = 40;
const SITE_ASSETS_BUCKET = "site-assets";
const SYNC_BUCKETS = ["site-assets", "property-images", "blog-images", "avatars"];

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function convertToWebP(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, "image/webp", 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ── Liệt kê đệ quy tất cả file trong bucket ──────────────────────────────────
async function listBucketFiles(supabase, bucket, folder = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 200 });
  if (error || !data) return [];

  const files = [];
  for (const item of data) {
    if (item.id === null) {
      // là folder — đệ quy
      const subFiles = await listBucketFiles(supabase, bucket, folder ? `${folder}/${item.name}` : item.name);
      files.push(...subFiles);
    } else {
      files.push({ ...item, folder });
    }
  }
  return files;
}

// ── Tab Thư viện (media_library) ─────────────────────────────────────────────
function LibraryTab({ profile }) {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [items, setItems]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [syncing, setSyncing]           = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);
  const [view, setView]                 = useState("grid");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("media_library")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) query = query.ilike("original_name", `%${search}%`);

    const { data, count, error } = await query;
    if (error) toast.error(error.message);
    setItems(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  // ── Đồng bộ từ Storage ──
  async function handleSync() {
    setSyncing(true);
    toast("Đang quét Storage bucket...", { icon: "🔍" });

    try {
      // Lấy tất cả URL đã có trong media_library
      const { data: existing } = await supabase
        .from("media_library")
        .select("storage_path");
      const existingPaths = new Set((existing || []).map(r => r.storage_path));

      // Quét tất cả các bucket
      let imported = 0;
      for (const bucket of SYNC_BUCKETS) {
        let allFiles = [];
        try {
          allFiles = await listBucketFiles(supabase, bucket);
        } catch (_) {
          continue; // bucket không tồn tại — bỏ qua
        }

        const newFiles = allFiles.filter(f => {
          const path = f.folder ? `${f.folder}/${f.name}` : f.name;
          return !existingPaths.has(`${bucket}::${path}`) && !existingPaths.has(path);
        });

        for (const f of newFiles) {
          const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name);
          if (!isImage) continue;

          const storagePath = f.folder ? `${f.folder}/${f.name}` : f.name;
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);

          const { error: insErr } = await supabase.from("media_library").insert({
            filename:      f.name,
            original_name: f.name,
            bucket,
            storage_path:  storagePath,
            url:           publicUrl,
            mime_type:     f.metadata?.mimetype || "image/jpeg",
            size:          f.metadata?.size || 0,
            uploaded_by:   profile?.id || null,
          });
          if (!insErr) imported++;
        }
      }

      if (imported === 0) {
        toast.success("Thư viện đã đồng bộ, không có ảnh mới");
        setSyncing(false);
        return;
      }
      toast.success(`Đã import ${imported} ảnh từ Storage`);
      load();
    } catch (err) {
      toast.error("Lỗi đồng bộ: " + err.message);
    }
    setSyncing(false);
  }

  // ── Upload ──
  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const results = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name}: Chỉ hỗ trợ ảnh`); continue; }
      setUploadProgress(prev => [...prev, { name: file.name, status: "uploading" }]);

      try {
        const webpBlob = await convertToWebP(file);
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const fileName = `${Date.now()}_${baseName}.webp`;
        const storagePath = `media/${fileName}`;

        const { error: upErr } = await supabase.storage
          .from(SITE_ASSETS_BUCKET)
          .upload(storagePath, webpBlob, { contentType: "image/webp", upsert: false });
        if (upErr) throw upErr;

        const { data: { publicUrl } } = supabase.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(storagePath);

        let width = null, height = null;
        try {
          const imgEl = new Image();
          imgEl.src = URL.createObjectURL(webpBlob);
          await new Promise(r => { imgEl.onload = r; });
          width = imgEl.naturalWidth; height = imgEl.naturalHeight;
          URL.revokeObjectURL(imgEl.src);
        } catch (_) {}

        await supabase.from("media_library").insert({
          filename: fileName, original_name: file.name,
          bucket: SITE_ASSETS_BUCKET, storage_path: storagePath, url: publicUrl,
          mime_type: "image/webp", size: webpBlob.size,
          width, height, uploaded_by: profile?.id || null,
        });

        setUploadProgress(prev => prev.map(p => p.name === file.name ? { ...p, status: "done" } : p));
        results.push(fileName);
      } catch (err) {
        toast.error(`${file.name}: ${err.message}`);
        setUploadProgress(prev => prev.map(p => p.name === file.name ? { ...p, status: "error" } : p));
      }
    }

    if (results.length > 0) { toast.success(`Đã tải lên ${results.length} ảnh`); load(); }
    setTimeout(() => setUploadProgress([]), 3000);
    setUploading(false);
  }

  async function handleDelete(item) {
    if (!confirm(`Xóa ảnh "${item.original_name || item.filename}"?`)) return;
    setDeleteLoading(true);
    await supabase.storage.from(item.bucket).remove([item.storage_path]);
    const { error } = await supabase.from("media_library").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); if (selected?.id === item.id) setSelected(null); load(); }
    setDeleteLoading(false);
  }

  function copyUrl(url) { navigator.clipboard.writeText(url); toast.success("Đã copy URL"); }
  function handleDrop(e) { e.preventDefault(); handleFiles(e.dataTransfer.files); }
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="media-layout">
      <div className="media-main">
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
          <div className="admin-search" style={{ flex: 1 }}>
            <i className="icon icon-search search-icon" />
            <input type="text" placeholder="Tìm theo tên file..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={`admin-btn btn-sm ${view === "grid" ? "btn-primary" : "btn-outline"}`} onClick={() => setView("grid")}>⊞</button>
            <button className={`admin-btn btn-sm ${view === "list" ? "btn-primary" : "btn-outline"}`} onClick={() => setView("list")}>☰</button>
          </div>
          <span style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>{total} ảnh</span>
          <button className="admin-btn btn-outline btn-sm" onClick={handleSync} disabled={syncing}>
            {syncing ? "Đang quét..." : "⟳ Đồng bộ Storage"}
          </button>
          <button className="admin-btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <i className="icon icon-send" /> {uploading ? "Đang tải..." : "Tải lên"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* Upload progress */}
        {uploadProgress.length > 0 && (
          <div className="media-upload-progress">
            {uploadProgress.map((p, i) => (
              <div key={i} className={`media-upload-item ${p.status}`}>
                <i className={`icon ${p.status === "done" ? "icon-tick1" : p.status === "error" ? "icon-x" : "icon-send"}`} />
                <span>{p.name}</span>
                <span className="upload-status">{p.status === "done" ? "✓" : p.status === "error" ? "✗" : "..."}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty / Drop zone */}
        {!loading && items.length === 0 && (
          <div className="media-dropzone" onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
            <i className="icon icon-images" style={{ fontSize: 32, color: "#94a3b8" }} />
            <p style={{ color: "#64748b", marginTop: 8 }}>Kéo thả ảnh vào đây hoặc click để chọn</p>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Nếu đã có ảnh cũ, nhấn <strong>"Đồng bộ Storage"</strong> để import</p>
          </div>
        )}

        {/* Grid */}
        {view === "grid" && items.length > 0 && (
          <div className="media-grid" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="media-thumb skeleton" />)
              : items.map(item => (
                <div key={item.id} className={`media-thumb${selected?.id === item.id ? " selected" : ""}`}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}>
                  <img src={item.url} alt={item.alt_text || item.original_name} loading="lazy" />
                  <div className="media-thumb-overlay">
                    <button className="media-copy-btn" onClick={e => { e.stopPropagation(); copyUrl(item.url); }} title="Copy URL">⧉</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* List */}
        {view === "list" && items.length > 0 && (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>Xem trước</th>
                    <th>Tên file</th>
                    <th>Kích thước</th>
                    <th>Ngày tải</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)}
                      style={{ cursor: "pointer", background: selected?.id === item.id ? "#eff6ff" : undefined }}>
                      <td><img src={item.url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} /></td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{item.original_name || item.filename}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.storage_path}</div>
                      </td>
                      <td style={{ fontSize: 13, color: "#64748b" }}>{formatBytes(item.size)}</td>
                      <td style={{ fontSize: 13, color: "#64748b" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="admin-btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); copyUrl(item.url); }}>Copy URL</button>
                          <button className="admin-btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(item); }} disabled={deleteLoading}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pp => (
              <button key={pp} className={`page-btn${pp === page ? " active" : ""}`} onClick={() => setPage(pp)}>{pp}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel item={selected} supabase={supabase} onDelete={handleDelete} onCopy={copyUrl} deleteLoading={deleteLoading} onSaved={load} />
      )}
    </div>
  );
}

// ── Tab Ảnh tin đăng (property_images) ───────────────────────────────────────
function PropertyImagesTab() {
  const supabase = createClient();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("property_images")
      .select("id, url, sort_order, is_primary, property_id, properties(title)", { count: "exact" })
      .order("id", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, count } = await query;
    setItems(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function copyUrl(url) { navigator.clipboard.writeText(url); toast.success("Đã copy URL"); }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: 12, padding: "10px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
        <i className="icon icon-tick1" style={{ marginRight: 6 }} />
        Hiển thị ảnh từ bảng <code>property_images</code>. Chỉ xem và copy URL, không xóa được từ đây.
      </div>
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>Ảnh</th>
                <th>Tin đăng</th>
                <th>Thứ tự</th>
                <th>Ảnh chính</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có ảnh</td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td>
                    <img src={item.url} alt="" style={{ width: 56, height: 44, objectFit: "cover", borderRadius: 6 }} />
                  </td>
                  <td style={{ fontSize: 13, color: "#374151" }}>
                    {item.properties?.title
                      ? item.properties.title
                      : <span style={{ color: "#94a3b8" }}>Tin đã xóa (ID: {item.property_id})</span>}
                  </td>
                  <td style={{ fontSize: 13, color: "#94a3b8" }}>{item.sort_order ?? "—"}</td>
                  <td>{item.is_primary && <span className="admin-badge badge-published" style={{ fontSize: 11 }}>Ảnh chính</span>}</td>
                  <td>
                    <button className="admin-btn btn-outline btn-sm" onClick={() => copyUrl(item.url)}>Copy URL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pp => (
            <button key={pp} className={`page-btn${pp === page ? " active" : ""}`} onClick={() => setPage(pp)}>{pp}</button>
          ))}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}

// ── Tab Ảnh blog (posts.image_url) ───────────────────────────────────────────
function BlogImagesTab() {
  const supabase = createClient();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title, image_url, slug, created_at")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  function copyUrl(url) { navigator.clipboard.writeText(url); toast.success("Đã copy URL"); }

  return (
    <div>
      <div style={{ marginBottom: 12, padding: "10px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
        <i className="icon icon-tick1" style={{ marginRight: 6 }} />
        Ảnh cover của các bài viết blog. Chỉ xem và copy URL.
      </div>
      <div className="media-grid" style={{ marginTop: 0 }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="media-thumb skeleton" />)
          : items.length === 0
          ? <p style={{ color: "#94a3b8", fontSize: 14 }}>Không có bài viết nào có ảnh cover</p>
          : items.map(item => (
            <div key={item.id} style={{ position: "relative" }}>
              <div className="media-thumb">
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div className="media-thumb-overlay">
                  <button className="media-copy-btn" onClick={() => copyUrl(item.image_url)} title="Copy URL">⧉</button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ item, supabase, onDelete, onCopy, deleteLoading, onSaved }) {
  return (
    <div className="media-detail-panel">
      <div className="media-detail-header">
        <h6 className="mb-0">Chi tiết</h6>
        <button className="admin-btn btn-ghost btn-sm" onClick={() => onDelete(item)}>✕</button>
      </div>
      <div className="media-detail-preview">
        <img src={item.url} alt={item.alt_text || item.original_name} />
      </div>
      <div className="media-detail-body">
        <div className="media-detail-row"><span className="detail-label">Tên file:</span><span className="detail-value">{item.original_name || item.filename}</span></div>
        <div className="media-detail-row"><span className="detail-label">Kích thước:</span><span className="detail-value">{formatBytes(item.size)}</span></div>
        {item.width && item.height && (
          <div className="media-detail-row"><span className="detail-label">Kích cỡ:</span><span className="detail-value">{item.width} × {item.height} px</span></div>
        )}
        <div className="media-detail-row"><span className="detail-label">Đường dẫn:</span><span className="detail-value" style={{ fontSize: 11 }}>{item.storage_path}</span></div>
        <div className="media-detail-row"><span className="detail-label">Ngày tải:</span><span className="detail-value">{item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "—"}</span></div>
        <div className="mt-3">
          <label className="form-label small fw-6">URL ảnh</label>
          <div className="media-url-copy">
            <input type="text" className="form-control form-control-sm" value={item.url} readOnly style={{ fontSize: 11 }} />
            <button className="admin-btn btn-outline btn-sm" onClick={() => onCopy(item.url)}>Copy</button>
          </div>
        </div>
        <div className="mt-3">
          <label className="form-label small fw-6">Alt text</label>
          <AltEditor item={item} supabase={supabase} onSaved={onSaved} />
        </div>
        <div className="mt-3">
          <button className="admin-btn btn-danger btn-sm w-100" onClick={() => onDelete(item)} disabled={deleteLoading}>
            <i className="icon icon-trash" /> Xóa ảnh này
          </button>
        </div>
      </div>
    </div>
  );
}

function AltEditor({ item, supabase, onSaved }) {
  const [val, setVal]       = useState(item.alt_text || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setVal(item.alt_text || ""); }, [item.id]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("media_library").update({ alt_text: val }).eq("id", item.id);
    if (error) toast.error(error.message);
    else { toast.success("Đã lưu alt text"); onSaved(); }
    setSaving(false);
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input type="text" className="form-control form-control-sm" value={val}
        onChange={e => setVal(e.target.value)} placeholder="Mô tả ảnh..."
        onKeyDown={e => { if (e.key === "Enter") save(); }} />
      <button className="admin-btn btn-outline btn-sm" onClick={save} disabled={saving}>{saving ? "..." : "Lưu"}</button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("library");

  const TABS = [
    { key: "library",   label: "Thư viện" },
    { key: "property",  label: "Ảnh tin đăng" },
    { key: "blog",      label: "Ảnh blog" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Thư viện Media</h4>
          <p>Quản lý tất cả ảnh và tài nguyên trên hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #e2e8f0" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 20px", border: "none", background: "transparent",
            fontWeight: tab === t.key ? 700 : 500, fontSize: 14,
            color: tab === t.key ? "#6366f1" : "#64748b",
            borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
            marginBottom: -1, cursor: "pointer", transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "library"  && <LibraryTab profile={profile} />}
      {tab === "property" && <PropertyImagesTab />}
      {tab === "blog"     && <BlogImagesTab />}
    </div>
  );
}
