"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";

const SOCIAL_KEYS = [
  { key: "facebook",  label: "Facebook",  icon: "🔵" },
  { key: "youtube",   label: "YouTube",   icon: "🔴" },
  { key: "zalo",      label: "Zalo",      icon: "🔷" },
  { key: "instagram", label: "Instagram", icon: "🟣" },
  { key: "twitter",   label: "Twitter/X", icon: "⚫" },
  { key: "linkedin",  label: "LinkedIn",  icon: "🔵" },
];
const CONTACT_KEYS = [
  { key: "address",     label: "Địa chỉ",    icon: "icon-mapPinLine" },
  { key: "phone",       label: "Điện thoại", icon: "icon-phone2" },
  { key: "email",       label: "Email",      icon: "icon-mail" },
  { key: "description", label: "Mô tả ngắn", icon: "icon-edit" },
  { key: "copyright",   label: "Copyright",  icon: "icon-info" },
];

export default function AdminFooterPage() {
  const [tab, setTab]         = useState("sections");
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // New section form
  const [newSection, setNewSection] = useState("");
  // Expanded section to manage links
  const [expandedSection, setExpandedSection] = useState(null);
  const [links, setLinks]       = useState([]);
  const [newLink, setNewLink]   = useState({ label: "", url: "" });
  const [editLinkId, setEditLinkId]   = useState(null);
  const [editLinkForm, setEditLinkForm] = useState(null);

  const supabase = createClient();

  const loadSections = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("footer_sections")
      .select("*")
      .order("sort_order");
    setSections(data || []);
    setLoading(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const m = {};
      data.forEach(r => { m[r.key] = r.value || ""; });
      setSettings(m);
    }
  }, []);

  useEffect(() => { loadSections(); loadSettings(); }, [loadSections, loadSettings]);

  async function loadLinks(sectionId) {
    const { data } = await supabase
      .from("footer_links")
      .select("*")
      .eq("section_id", sectionId)
      .order("sort_order");
    setLinks(data || []);
  }

  function toggleSection(id) {
    if (expandedSection === id) {
      setExpandedSection(null);
      setLinks([]);
    } else {
      setExpandedSection(id);
      setNewLink({ label: "", url: "" });
      setEditLinkId(null);
      loadLinks(id);
    }
  }

  // ── Sections CRUD ──
  async function addSection(e) {
    e.preventDefault();
    if (!newSection.trim()) return toast.error("Nhập tên cột footer");
    setSaving(true);
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const { error } = await supabase.from("footer_sections").insert({
      title: newSection.trim(), sort_order: maxOrder + 1,
    });
    if (error) toast.error(error.message);
    else { toast.success("Đã thêm cột"); setNewSection(""); loadSections(); }
    setSaving(false);
  }

  async function deleteSection(id) {
    if (!confirm("Xóa cột này? Tất cả link trong cột cũng bị xóa.")) return;
    const { error } = await supabase.from("footer_sections").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); if (expandedSection === id) setExpandedSection(null); loadSections(); }
  }

  async function moveSection(id, dir) {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(s => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    const cur = sorted[idx];
    await Promise.all([
      supabase.from("footer_sections").update({ sort_order: swap.sort_order }).eq("id", cur.id),
      supabase.from("footer_sections").update({ sort_order: cur.sort_order }).eq("id", swap.id),
    ]);
    loadSections();
  }

  async function renameSectionInline(id, newTitle) {
    const { error } = await supabase.from("footer_sections").update({ title: newTitle }).eq("id", id);
    if (error) toast.error(error.message);
    else loadSections();
  }

  // ── Links CRUD ──
  async function addLink(e) {
    e.preventDefault();
    if (!newLink.label.trim() || !newLink.url.trim()) return toast.error("Nhập đầy đủ thông tin");
    setSaving(true);
    const maxOrder = links.reduce((m, l) => Math.max(m, l.sort_order), 0);
    const { error } = await supabase.from("footer_links").insert({
      section_id: expandedSection,
      label: newLink.label.trim(),
      url: newLink.url.trim(),
      sort_order: maxOrder + 1,
    });
    if (error) toast.error(error.message);
    else { toast.success("Đã thêm link"); setNewLink({ label: "", url: "" }); loadLinks(expandedSection); }
    setSaving(false);
  }

  async function deleteLink(id) {
    const { error } = await supabase.from("footer_links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); loadLinks(expandedSection); }
  }

  async function saveEditLink(id) {
    if (!editLinkForm.label.trim()) return toast.error("Nhập nhãn");
    setSaving(true);
    const { error } = await supabase.from("footer_links").update({
      label: editLinkForm.label.trim(),
      url: editLinkForm.url.trim(),
      open_new_tab: editLinkForm.open_new_tab,
    }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã lưu"); setEditLinkId(null); loadLinks(expandedSection); }
    setSaving(false);
  }

  async function moveLinkItem(id, dir) {
    const sorted = [...links].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(l => l.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    const cur = sorted[idx];
    await Promise.all([
      supabase.from("footer_links").update({ sort_order: swap.sort_order }).eq("id", cur.id),
      supabase.from("footer_links").update({ sort_order: cur.sort_order }).eq("id", swap.id),
    ]);
    loadLinks(expandedSection);
  }

  // ── Settings save ──
  async function saveSetting(key, value) {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error(error.message);
    else toast.success("Đã lưu");
    setSaving(false);
  }

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Footer</h1>
        <p className="admin-page-desc text-muted">
          Cấu hình footer website: cột liên kết, thông tin liên hệ, mạng xã hội
        </p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {[
          { key: "sections", label: "Cột & Liên kết" },
          { key: "contact",  label: "Thông tin liên hệ" },
          { key: "social",   label: "Mạng xã hội" },
        ].map(t => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >{t.label}</button>
          </li>
        ))}
      </ul>

      {/* ── Tab: Sections & Links ── */}
      {tab === "sections" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="admin-card">
              <div className="admin-card-header">
                <h5 className="mb-0">Thêm cột footer</h5>
              </div>
              <div className="admin-card-body">
                <form onSubmit={addSection}>
                  <div className="mb-3">
                    <label className="form-label fw-6">Tiêu đề cột <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      value={newSection}
                      onChange={e => setNewSection(e.target.value)}
                      placeholder="Vd: Liên kết nhanh"
                    />
                  </div>
                  <button type="submit" className="tf-btn btn-view primary w-100" disabled={saving}>
                    + Thêm cột
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="admin-card">
              <div className="admin-card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Danh sách cột footer</h5>
                <span className="badge bg-secondary">{sections.length} cột</span>
              </div>
              <div className="admin-card-body p-0">
                {loading ? (
                  <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
                ) : sortedSections.length === 0 ? (
                  <div className="text-center py-4 text-muted">Chưa có cột nào</div>
                ) : (
                  sortedSections.map((sec, si) => (
                    <div key={sec.id} className="footer-section-block border-bottom">
                      <div className="footer-section-header d-flex align-items-center gap-2 p-3">
                        <div className="d-flex gap-1">
                          <button className="btn btn-xs btn-outline-secondary" disabled={si === 0} onClick={() => moveSection(sec.id, "up")}>▲</button>
                          <button className="btn btn-xs btn-outline-secondary" disabled={si === sortedSections.length - 1} onClick={() => moveSection(sec.id, "down")}>▼</button>
                        </div>
                        <EditableTitle
                          value={sec.title}
                          onSave={v => renameSectionInline(sec.id, v)}
                        />
                        <div className="ms-auto d-flex gap-1">
                          <button
                            className={`btn btn-sm ${expandedSection === sec.id ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => toggleSection(sec.id)}
                          >
                            {expandedSection === sec.id ? "Thu gọn" : `Quản lý links`}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSection(sec.id)}>Xóa</button>
                        </div>
                      </div>

                      {/* Expanded links panel */}
                      {expandedSection === sec.id && (
                        <div className="footer-links-panel p-3 bg-light border-top">
                          {/* Links list */}
                          {links.length === 0 ? (
                            <p className="text-muted small mb-2">Chưa có link nào trong cột này</p>
                          ) : (
                            <table className="table table-sm table-borderless mb-3">
                              <thead>
                                <tr>
                                  <th style={{ width: 30 }}>#</th>
                                  <th>Nhãn</th>
                                  <th>URL</th>
                                  <th style={{ width: 140 }}>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {links.map((link, li) => (
                                  <tr key={link.id}>
                                    {editLinkId === link.id ? (
                                      <td colSpan={4}>
                                        <div className="d-flex gap-2 align-items-end">
                                          <input className="form-control form-control-sm" value={editLinkForm.label} onChange={e => setEditLinkForm(f => ({ ...f, label: e.target.value }))} placeholder="Nhãn" />
                                          <input className="form-control form-control-sm" value={editLinkForm.url} onChange={e => setEditLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="URL" />
                                          <button className="btn btn-sm btn-primary" onClick={() => saveEditLink(link.id)} disabled={saving}>Lưu</button>
                                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditLinkId(null)}>Hủy</button>
                                        </div>
                                      </td>
                                    ) : (
                                      <>
                                        <td>{li + 1}</td>
                                        <td>{link.label}</td>
                                        <td className="text-muted small">{link.url}</td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button className="btn btn-xs btn-outline-secondary" disabled={li === 0} onClick={() => moveLinkItem(link.id, "up")}>▲</button>
                                            <button className="btn btn-xs btn-outline-secondary" disabled={li === links.length - 1} onClick={() => moveLinkItem(link.id, "down")}>▼</button>
                                            <button className="btn btn-xs btn-outline-warning" onClick={() => { setEditLinkId(link.id); setEditLinkForm({ label: link.label, url: link.url, open_new_tab: link.open_new_tab }); }}>✎</button>
                                            <button className="btn btn-xs btn-outline-danger" onClick={() => deleteLink(link.id)}>✕</button>
                                          </div>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          {/* Add link form */}
                          <form className="d-flex gap-2" onSubmit={addLink}>
                            <input className="form-control form-control-sm" value={newLink.label} onChange={e => setNewLink(f => ({ ...f, label: e.target.value }))} placeholder="Nhãn link" />
                            <input className="form-control form-control-sm" value={newLink.url} onChange={e => setNewLink(f => ({ ...f, url: e.target.value }))} placeholder="URL (vd: /contact)" />
                            <button type="submit" className="btn btn-sm btn-primary text-nowrap" disabled={saving}>+ Thêm</button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Contact Info ── */}
      {tab === "contact" && (
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Logo manager */}
            <div className="admin-card mb-4">
              <div className="admin-card-header">
                <h5 className="mb-0">Logo website</h5>
              </div>
              <div className="admin-card-body">
                <p className="text-muted small mb-4">
                  Logo dùng chung cho <strong>header</strong> và <strong>footer</strong>.
                  Tải file lên hoặc nhập URL trực tiếp. Khuyến nghị: PNG trong suốt, tỷ lệ ~3.5:1, chiều cao 48px.
                </p>
                <div className="row g-4">
                  <div className="col-md-6">
                    <LogoUploader
                      label="Logo màu tối (Header — nền trắng)"
                      settingKey="logo_dark"
                      value={settings.logo_dark || ""}
                      onChange={v => setSettings(s => ({ ...s, logo_dark: v }))}
                      onSave={() => saveSetting("logo_dark", settings.logo_dark)}
                      saving={saving}
                      supabase={createClient()}
                    />
                  </div>
                  <div className="col-md-6">
                    <LogoUploader
                      label="Logo màu trắng (Header scroll + Footer)"
                      settingKey="logo_white"
                      value={settings.logo_white || ""}
                      onChange={v => setSettings(s => ({ ...s, logo_white: v }))}
                      onSave={() => saveSetting("logo_white", settings.logo_white)}
                      saving={saving}
                      supabase={createClient()}
                      darkPreview
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h5 className="mb-0">Thông tin liên hệ & Mô tả</h5>
              </div>
              <div className="admin-card-body">
                {CONTACT_KEYS.map(({ key, label, icon }) => (
                  <SettingRow
                    key={key}
                    field={key}
                    label={label}
                    icon={icon}
                    value={settings[key] || ""}
                    onChange={v => setSettings(s => ({ ...s, [key]: v }))}
                    onSave={() => saveSetting(key, settings[key])}
                    saving={saving}
                    multiline={key === "description"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Social Media ── */}
      {tab === "social" && (
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="admin-card">
              <div className="admin-card-header">
                <h5 className="mb-0">Liên kết mạng xã hội</h5>
              </div>
              <div className="admin-card-body">
                <p className="text-muted small mb-3">
                  Nhập URL đầy đủ. Để trống hoặc nhập <code>#</code> để ẩn icon đó.
                </p>
                {SOCIAL_KEYS.map(({ key, label, icon }) => (
                  <SettingRow
                    key={key}
                    field={key}
                    label={`${icon} ${label}`}
                    value={settings[key] || ""}
                    onChange={v => setSettings(s => ({ ...s, [key]: v }))}
                    onSave={() => saveSetting(key, settings[key])}
                    saving={saving}
                    placeholder="https://..."
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ field, label, icon, value, onChange, onSave, saving, multiline, placeholder }) {
  return (
    <div className="mb-4">
      <label className="form-label fw-6">
        {icon && <i className={`icon ${icon} me-2 text-muted`} />}
        {label}
      </label>
      <div className="d-flex gap-2 align-items-start">
        {multiline ? (
          <textarea
            className="form-control"
            rows={3}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            className="form-control"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
          />
        )}
        <button
          className="btn btn-primary text-nowrap"
          style={{ minWidth: 70 }}
          onClick={onSave}
          disabled={saving}
        >Lưu</button>
      </div>
    </div>
  );
}

function EditableTitle({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return editing ? (
    <div className="d-flex gap-2 align-items-center flex-grow-1">
      <input
        className="form-control form-control-sm"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { onSave(val); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
        autoFocus
      />
      <button className="btn btn-sm btn-primary" onClick={() => { onSave(val); setEditing(false); }}>✓</button>
      <button className="btn btn-sm btn-outline-secondary" onClick={() => { setVal(value); setEditing(false); }}>✕</button>
    </div>
  ) : (
    <span
      className="fw-6 flex-grow-1"
      style={{ cursor: "pointer" }}
      onDoubleClick={() => { setVal(value); setEditing(true); }}
      title="Double-click để đổi tên"
    >
      {value}
      <i className="icon icon-edit ms-2 text-muted" style={{ fontSize: 12 }} />
    </span>
  );
}

function LogoUploader({ label, settingKey, value, onChange, onSave, saving, supabase, darkPreview = false }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `logos/${settingKey}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Tải lên thành công — nhấn Lưu để áp dụng");
    } catch (err) {
      toast.error(err.message || "Lỗi tải file");
    }
    setUploading(false);
    e.target.value = "";
  }

  const previewBg = darkPreview ? "#1e293b" : "#f8fafc";

  return (
    <div>
      <label className="form-label fw-6 d-block mb-2">{label}</label>

      {/* Preview */}
      <div
        className="logo-preview-box mb-3 d-flex align-items-center justify-content-center rounded border"
        style={{ background: previewBg, height: 80, overflow: "hidden" }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="logo preview"
            style={{ maxHeight: 56, maxWidth: "100%", objectFit: "contain" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="text-muted small">Chưa có logo</span>
        )}
      </div>

      {/* URL input */}
      <div className="d-flex gap-2 mb-2">
        <input
          className="form-control form-control-sm"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="URL logo hoặc tải file lên ↓"
        />
        <button
          className="btn btn-sm btn-primary text-nowrap"
          onClick={onSave}
          disabled={saving || uploading}
        >Lưu</button>
      </div>

      {/* File upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        className="btn btn-sm btn-outline-secondary w-100"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Đang tải lên..." : "📁 Tải file lên từ máy tính"}
      </button>
      <div className="form-text mt-1">PNG trong suốt, SVG hoặc WebP — tối đa 5MB</div>
    </div>
  );
}
