"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

// ── Tab: Danh mục (property_categories_cms) ──────────────────────────────────
const CAT_BLANK = { name: "", slug: "", icon: "", description: "", type_ids: [], is_active: true };

function CategoriesTab({ propTypes }) {
  const supabase = createClient();
  const [cats, setCats]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(CAT_BLANK);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("property_categories_cms").select("*").order("sort_order");
    setCats(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditId(null);
    setForm(CAT_BLANK);
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditId(cat.id);
    setForm({
      name:        cat.name,
      slug:        cat.slug || "",
      icon:        cat.icon || "",
      description: cat.description || "",
      type_ids:    cat.type_ids || [],
      is_active:   cat.is_active,
    });
    setShowModal(true);
  }

  function handleNameChange(name) {
    setForm(f => ({ ...f, name, slug: editId ? f.slug : toSlug(name) }));
  }

  function toggleTypeId(id) {
    setForm(f => ({
      ...f,
      type_ids: f.type_ids.includes(id)
        ? f.type_ids.filter(x => x !== id)
        : [...f.type_ids, id],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Nhập tên danh mục");
    if (!form.slug.trim()) return toast.error("Nhập slug");
    setSaving(true);

    const payload = {
      name:        form.name.trim(),
      slug:        form.slug.trim(),
      icon:        form.icon.trim(),
      description: form.description.trim(),
      type_ids:    form.type_ids,
      is_active:   form.is_active,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("property_categories_cms").update(payload).eq("id", editId));
    } else {
      const maxOrder = cats.reduce((m, c) => Math.max(m, c.sort_order), 0);
      ({ error } = await supabase.from("property_categories_cms").insert({ ...payload, sort_order: maxOrder + 1 }));
    }

    if (error) toast.error(error.message);
    else { toast.success(editId ? "Đã cập nhật" : "Đã thêm danh mục"); setShowModal(false); load(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Xóa danh mục này?")) return;
    const { error } = await supabase.from("property_categories_cms").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); load(); }
  }

  async function toggleActive(id, cur) {
    await supabase.from("property_categories_cms").update({ is_active: !cur }).eq("id", id);
    load();
  }

  async function move(id, dir) {
    const sorted = [...cats].sort((a, b) => a.sort_order - b.sort_order);
    const idx  = sorted.findIndex(c => c.id === id);
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    await Promise.all([
      supabase.from("property_categories_cms").update({ sort_order: sorted[swap].sort_order }).eq("id", sorted[idx].id),
      supabase.from("property_categories_cms").update({ sort_order: sorted[idx].sort_order }).eq("id", sorted[swap].id),
    ]);
    load();
  }

  // Map id → name for display
  const typeMap = Object.fromEntries(propTypes.map(t => [t.id, t.name]));
  const sorted  = [...cats].sort((a, b) => a.sort_order - b.sort_order);

  // Group propTypes by parent for the modal checkbox list
  const parents  = propTypes.filter(t => !t.parent_id);
  const children = propTypes.filter(t => !!t.parent_id);

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h6 className="mb-0">Danh sách danh mục ({cats.length})</h6>
          <button className="admin-btn btn-primary btn-sm" onClick={openAdd}>+ Thêm danh mục</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Thứ tự</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Loại hình đã gán</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Chưa có danh mục. <button className="admin-btn btn-ghost btn-sm" onClick={openAdd}>Thêm ngay</button></td></tr>
              ) : sorted.map((cat, i) => (
                <tr key={cat.id} style={{ opacity: cat.is_active ? 1 : 0.55 }}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button className="admin-btn btn-ghost btn-sm" disabled={i === 0} onClick={() => move(cat.id, "up")}>▲</button>
                      <button className="admin-btn btn-ghost btn-sm" disabled={i === sorted.length - 1} onClick={() => move(cat.id, "down")}>▼</button>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
                    {cat.description && <div style={{ fontSize: 12, color: "#94a3b8" }}>{cat.description}</div>}
                  </td>
                  <td><code style={{ fontSize: 12, color: "#6366f1" }}>{cat.slug}</code></td>
                  <td style={{ fontSize: 20 }}>{cat.icon || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 260 }}>
                      {(cat.type_ids || []).length === 0 ? (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Chưa gán</span>
                      ) : (cat.type_ids || []).map(tid => (
                        <span key={tid} className="admin-badge badge-published" style={{ fontSize: 11 }}>
                          {typeMap[tid] || `ID:${tid}`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${cat.is_active ? "badge-published" : "badge-draft"}`}>
                      {cat.is_active ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn btn-outline btn-sm" onClick={() => openEdit(cat)}>Sửa</button>
                      <button className={`admin-btn btn-sm ${cat.is_active ? "btn-outline" : "btn-success"}`} onClick={() => toggleActive(cat.id, cat.is_active)}>
                        {cat.is_active ? "Ẩn" : "Hiện"}
                      </button>
                      <button className="admin-btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-6">Tên danh mục <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Vd: Căn hộ chung cư" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-6">Slug <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="can-ho-chung-cu" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-6">Icon</label>
                    <input className="form-control" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏠" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-6">Mô tả ngắn</label>
                    <input className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả danh mục..." />
                  </div>

                  {/* Chọn loại hình BĐS */}
                  <div className="col-12">
                    <label className="form-label fw-6">
                      Loại hình BĐS thuộc danh mục này
                      <span className="text-muted ms-2" style={{ fontSize: 12, fontWeight: 400 }}>({form.type_ids.length} đã chọn)</span>
                    </label>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, maxHeight: 280, overflowY: "auto", padding: "8px 0" }}>
                      {parents.map(parent => {
                        const subs = children.filter(c => c.parent_id === parent.id);
                        return (
                          <div key={parent.id}>
                            {/* Parent */}
                            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", fontWeight: 600, fontSize: 13, color: "#374151", cursor: "pointer", background: "#f8fafc" }}>
                              <input
                                type="checkbox"
                                className="admin-checkbox"
                                checked={form.type_ids.includes(parent.id)}
                                onChange={() => toggleTypeId(parent.id)}
                              />
                              {parent.name}
                            </label>
                            {/* Children */}
                            {subs.map(sub => (
                              <label key={sub.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 32px", fontSize: 13, color: "#4b5563", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  className="admin-checkbox"
                                  checked={form.type_ids.includes(sub.id)}
                                  onChange={() => toggleTypeId(sub.id)}
                                />
                                <span style={{ color: "#94a3b8", marginRight: 4 }}>└</span>
                                {sub.name}
                              </label>
                            ))}
                          </div>
                        );
                      })}
                      {/* Types without parents */}
                      {propTypes.filter(t => !t.parent_id && !parents.some(p => p.id === t.id)).map(t => (
                        <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" className="admin-checkbox" checked={form.type_ids.includes(t.id)} onChange={() => toggleTypeId(t.id)} />
                          {t.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="catActive" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="catActive">Hiển thị danh mục này trong bộ lọc</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="admin-btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="admin-btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm danh mục"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab: Loại hình BĐS (property_types) ──────────────────────────────────────
const TYPE_BLANK = { name: "", slug: "", parent_id: "" };

function PropertyTypesTab({ propTypes, reload }) {
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(TYPE_BLANK);
  const [saving, setSaving]       = useState(false);

  const parents  = propTypes.filter(t => !t.parent_id);
  const children = propTypes.filter(t => !!t.parent_id);

  function openAdd(parentId = "") {
    setEditId(null);
    setForm({ ...TYPE_BLANK, parent_id: parentId });
    setShowModal(true);
  }

  function openEdit(t) {
    setEditId(t.id);
    setForm({ name: t.name, slug: t.slug || "", parent_id: t.parent_id ?? "" });
    setShowModal(true);
  }

  function handleNameChange(name) {
    setForm(f => ({ ...f, name, slug: editId ? f.slug : toSlug(name) }));
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Nhập tên loại hình");
    setSaving(true);

    const payload = {
      name:      form.name.trim(),
      slug:      form.slug.trim() || toSlug(form.name),
      parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("property_types").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("property_types").insert(payload));
    }

    if (error) toast.error(error.message);
    else { toast.success(editId ? "Đã cập nhật" : "Đã thêm loại hình"); setShowModal(false); reload(); }
    setSaving(false);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Xóa loại hình "${name}"? Các tin đăng dùng loại này có thể bị ảnh hưởng.`)) return;
    const { error } = await supabase.from("property_types").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); reload(); }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h6 className="mb-0">Loại hình BĐS ({propTypes.length})</h6>
          <button className="admin-btn btn-primary btn-sm" onClick={() => openAdd()}>+ Thêm loại hình</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên loại hình</th>
                <th>Slug</th>
                <th>Nhóm cha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {propTypes.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có dữ liệu</td></tr>
              ) : parents.map(parent => (
                <>
                  {/* Parent row */}
                  <tr key={parent.id} style={{ background: "#f8fafc" }}>
                    <td style={{ fontSize: 12, color: "#94a3b8" }}>#{parent.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{parent.name}</div>
                    </td>
                    <td><code style={{ fontSize: 12, color: "#6366f1" }}>{parent.slug}</code></td>
                    <td><span style={{ fontSize: 12, color: "#94a3b8" }}>— Nhóm gốc</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-btn btn-ghost btn-sm" onClick={() => openAdd(parent.id)} title="Thêm loại con">+ Con</button>
                        <button className="admin-btn btn-outline btn-sm" onClick={() => openEdit(parent)}>Sửa</button>
                        <button className="admin-btn btn-danger btn-sm" onClick={() => handleDelete(parent.id, parent.name)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                  {/* Children rows */}
                  {children.filter(c => c.parent_id === parent.id).map(child => (
                    <tr key={child.id}>
                      <td style={{ fontSize: 12, color: "#94a3b8" }}>#{child.id}</td>
                      <td>
                        <div style={{ fontSize: 13, paddingLeft: 20, color: "#374151" }}>
                          <span style={{ color: "#cbd5e1", marginRight: 6 }}>└</span>
                          {child.name}
                        </div>
                      </td>
                      <td><code style={{ fontSize: 12, color: "#6366f1" }}>{child.slug}</code></td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{parent.name}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="admin-btn btn-outline btn-sm" onClick={() => openEdit(child)}>Sửa</button>
                          <button className="admin-btn btn-danger btn-sm" onClick={() => handleDelete(child.id, child.name)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
              {/* Orphan types (no parent found in list) */}
              {children.filter(c => !parents.some(p => p.id === c.parent_id)).map(t => (
                <tr key={t.id}>
                  <td style={{ fontSize: 12, color: "#94a3b8" }}>#{t.id}</td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{t.name}</td>
                  <td><code style={{ fontSize: 12, color: "#6366f1" }}>{t.slug}</code></td>
                  <td style={{ fontSize: 12, color: "#ef4444" }}>ID: {t.parent_id} (không tìm thấy)</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-btn btn-outline btn-sm" onClick={() => openEdit(t)}>Sửa</button>
                      <button className="admin-btn btn-danger btn-sm" onClick={() => handleDelete(t.id, t.name)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? "Chỉnh sửa loại hình" : "Thêm loại hình mới"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-6">Tên loại hình <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Vd: Căn hộ chung cư" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-6">Slug</label>
                    <input className="form-control" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="can-ho-chung-cu" />
                    <div className="form-text">Để trống sẽ tự tạo từ tên</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-6">Nhóm cha</label>
                    <select className="form-select" value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
                      <option value="">— Là nhóm gốc —</option>
                      {parents.filter(p => p.id !== editId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="admin-btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="admin-btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [tab, setTab]           = useState("categories"); // categories | types
  const [propTypes, setPropTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);

  const loadTypes = useCallback(async () => {
    setTypesLoading(true);
    const { data } = await supabase.from("property_types").select("id, name, slug, parent_id").order("id");
    setPropTypes(data || []);
    setTypesLoading(false);
  }, []);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  const TABS = [
    { key: "categories", label: "Danh mục BĐS" },
    { key: "types",      label: "Loại hình BĐS" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Danh mục &amp; Loại hình BĐS</h4>
          <p>Quản lý danh mục nhóm và các loại hình bất động sản trong hệ thống</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "transparent",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 14,
              color: tab === t.key ? "#6366f1" : "#64748b",
              borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >{t.label}</button>
        ))}
      </div>

      {typesLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Đang tải...</div>
      ) : tab === "categories" ? (
        <CategoriesTab propTypes={propTypes} />
      ) : (
        <PropertyTypesTab propTypes={propTypes} reload={loadTypes} />
      )}
    </div>
  );
}
