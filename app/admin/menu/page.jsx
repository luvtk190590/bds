"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const BLANK_ITEM = { label: "", url: "", parent_id: null, open_new_tab: false };

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK_ITEM);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("menu_location", "main")
      .order("sort_order");
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Parents = items without parent_id
  const parents = items.filter(i => !i.parent_id);
  // Children grouped by parent
  function children(parentId) {
    return items.filter(i => i.parent_id === parentId);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.label.trim()) return toast.error("Nhập nhãn hiển thị");
    setSaving(true);
    const maxOrder = items
      .filter(i => (form.parent_id ? i.parent_id === Number(form.parent_id) : !i.parent_id))
      .reduce((m, i) => Math.max(m, i.sort_order), 0);
    const { error } = await supabase.from("menu_items").insert({
      menu_location: "main",
      label: form.label.trim(),
      url: form.url.trim() || "#",
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      open_new_tab: form.open_new_tab,
      sort_order: maxOrder + 1,
    });
    if (error) toast.error(error.message);
    else { toast.success("Đã thêm mục menu"); setForm(BLANK_ITEM); load(); }
    setSaving(false);
  }

  async function handleSaveEdit(id) {
    if (!editForm.label.trim()) return toast.error("Nhập nhãn hiển thị");
    setSaving(true);
    const { error } = await supabase
      .from("menu_items")
      .update({
        label: editForm.label.trim(),
        url: editForm.url.trim() || "#",
        open_new_tab: editForm.open_new_tab,
        is_active: editForm.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã lưu"); setEditId(null); load(); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Xóa mục menu này? Các mục con cũng sẽ bị xóa.")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa"); load(); }
  }

  async function moveItem(id, direction) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const siblings = items
      .filter(i => i.parent_id === item.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex(i => i.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const swapItem = siblings[swapIdx];
    await Promise.all([
      supabase.from("menu_items").update({ sort_order: swapItem.sort_order }).eq("id", id),
      supabase.from("menu_items").update({ sort_order: item.sort_order }).eq("id", swapItem.id),
    ]);
    load();
  }

  async function toggleActive(id, current) {
    await supabase.from("menu_items").update({ is_active: !current }).eq("id", id);
    load();
  }

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Menu chính</h1>
        <p className="admin-page-desc text-muted">
          Thêm, sửa, xóa và sắp xếp các mục trong menu điều hướng trang web
        </p>
      </div>

      <div className="row g-4">
        {/* ── Left: Add item form ── */}
        <div className="col-lg-4">
          <div className="admin-card">
            <div className="admin-card-header">
              <h5 className="mb-0">Thêm mục menu</h5>
            </div>
            <div className="admin-card-body">
              <form onSubmit={handleAdd}>
                <div className="mb-3">
                  <label className="form-label fw-6">Nhãn hiển thị <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Vd: Trang chủ"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-6">URL</label>
                  <input
                    className="form-control"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="Vd: /properties-map"
                  />
                  <div className="form-text">Để trống nếu chỉ là tiêu đề nhóm</div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-6">Thuộc mục cha</label>
                  <select
                    className="form-select"
                    value={form.parent_id || ""}
                    onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))}
                  >
                    <option value="">— Mục top-level —</option>
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="newTab"
                      checked={form.open_new_tab}
                      onChange={e => setForm(f => ({ ...f, open_new_tab: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="newTab">
                      Mở trong tab mới
                    </label>
                  </div>
                </div>
                <button type="submit" className="tf-btn btn-view primary w-100" disabled={saving}>
                  {saving ? "Đang lưu..." : "+ Thêm vào menu"}
                </button>
              </form>
            </div>
          </div>

          <div className="admin-card mt-4">
            <div className="admin-card-header">
              <h5 className="mb-0">Hướng dẫn</h5>
            </div>
            <div className="admin-card-body">
              <ul className="list-unstyled mb-0" style={{ fontSize: 13, lineHeight: 1.7 }}>
                <li>• <strong>Mục top-level</strong>: hiển thị trên thanh menu</li>
                <li>• <strong>Mục con</strong>: hiển thị trong dropdown của mục cha</li>
                <li>• Dùng <strong>▲▼</strong> để sắp xếp thứ tự</li>
                <li>• Click <strong>✎</strong> để chỉnh sửa inline</li>
                <li>• Ẩn mục không xóa, vẫn giữ cấu trúc</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Right: Menu tree ── */}
        <div className="col-lg-8">
          <div className="admin-card">
            <div className="admin-card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Cấu trúc menu hiện tại</h5>
              <span className="badge bg-secondary">{parents.length} mục cha · {items.filter(i => i.parent_id).length} mục con</span>
            </div>
            <div className="admin-card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-5 text-muted">Chưa có mục menu nào</div>
              ) : (
                <div className="menu-tree-list">
                  {parents.map((parent, pi) => (
                    <div key={parent.id} className="menu-tree-group">
                      {/* Parent item */}
                      <MenuItemRow
                        item={parent}
                        isFirst={pi === 0}
                        isLast={pi === parents.length - 1}
                        isEditing={editId === parent.id}
                        editForm={editId === parent.id ? editForm : null}
                        onEdit={() => { setEditId(parent.id); setEditForm({ label: parent.label, url: parent.url, open_new_tab: parent.open_new_tab, is_active: parent.is_active }); }}
                        onCancelEdit={() => setEditId(null)}
                        onSaveEdit={() => handleSaveEdit(parent.id)}
                        onEditFormChange={setEditForm}
                        onDelete={() => handleDelete(parent.id)}
                        onMove={dir => moveItem(parent.id, dir)}
                        onToggleActive={() => toggleActive(parent.id, parent.is_active)}
                        saving={saving}
                        isParent
                      />
                      {/* Children */}
                      {children(parent.id).map((child, ci) => (
                        <MenuItemRow
                          key={child.id}
                          item={child}
                          isFirst={ci === 0}
                          isLast={ci === children(parent.id).length - 1}
                          isEditing={editId === child.id}
                          editForm={editId === child.id ? editForm : null}
                          onEdit={() => { setEditId(child.id); setEditForm({ label: child.label, url: child.url, open_new_tab: child.open_new_tab, is_active: child.is_active }); }}
                          onCancelEdit={() => setEditId(null)}
                          onSaveEdit={() => handleSaveEdit(child.id)}
                          onEditFormChange={setEditForm}
                          onDelete={() => handleDelete(child.id)}
                          onMove={dir => moveItem(child.id, dir)}
                          onToggleActive={() => toggleActive(child.id, child.is_active)}
                          saving={saving}
                          isParent={false}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItemRow({
  item, isFirst, isLast, isEditing, editForm, saving,
  isParent, onEdit, onCancelEdit, onSaveEdit, onEditFormChange,
  onDelete, onMove, onToggleActive,
}) {
  return (
    <div className={`menu-tree-item${isParent ? " menu-tree-parent" : " menu-tree-child"}${!item.is_active ? " menu-tree-inactive" : ""}`}>
      {isEditing ? (
        <div className="menu-tree-edit-form">
          <div className="row g-2 align-items-end">
            <div className="col-sm-4">
              <label className="form-label small mb-1">Nhãn</label>
              <input
                className="form-control form-control-sm"
                value={editForm.label}
                onChange={e => onEditFormChange(f => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="col-sm-4">
              <label className="form-label small mb-1">URL</label>
              <input
                className="form-control form-control-sm"
                value={editForm.url}
                onChange={e => onEditFormChange(f => ({ ...f, url: e.target.value }))}
              />
            </div>
            <div className="col-sm-2 d-flex align-items-center pt-3">
              <div className="form-check mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={editForm.open_new_tab}
                  onChange={e => onEditFormChange(f => ({ ...f, open_new_tab: e.target.checked }))}
                  id={`nt-${item.id}`}
                />
                <label className="form-check-label small" htmlFor={`nt-${item.id}`}>
                  Tab mới
                </label>
              </div>
            </div>
            <div className="col-sm-2 d-flex gap-1 pt-3">
              <button
                className="btn btn-sm btn-primary"
                onClick={onSaveEdit}
                disabled={saving}
              >Lưu</button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={onCancelEdit}
              >Hủy</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="menu-tree-row">
          <div className="menu-tree-label">
            {isParent ? (
              <i className="icon icon-list-dashes me-2 text-primary" />
            ) : (
              <span className="menu-tree-indent">└─</span>
            )}
            <span className={`menu-item-name${!item.is_active ? " text-muted" : ""}`}>
              {item.label}
            </span>
            {item.url && item.url !== "#" && (
              <span className="menu-item-url text-muted">{item.url}</span>
            )}
            {item.open_new_tab && (
              <span className="badge bg-info ms-1" style={{ fontSize: 10 }}>New tab</span>
            )}
            {!item.is_active && (
              <span className="badge bg-secondary ms-1" style={{ fontSize: 10 }}>Ẩn</span>
            )}
          </div>
          <div className="menu-tree-actions">
            <button
              className="btn btn-xs btn-outline-secondary"
              onClick={() => onMove("up")}
              disabled={isFirst}
              title="Lên"
            >▲</button>
            <button
              className="btn btn-xs btn-outline-secondary"
              onClick={() => onMove("down")}
              disabled={isLast}
              title="Xuống"
            >▼</button>
            <button
              className="btn btn-xs btn-outline-warning"
              onClick={onEdit}
              title="Chỉnh sửa"
            >✎</button>
            <button
              className={`btn btn-xs ${item.is_active ? "btn-outline-secondary" : "btn-outline-success"}`}
              onClick={onToggleActive}
              title={item.is_active ? "Ẩn" : "Hiện"}
            >{item.is_active ? "Ẩn" : "Hiện"}</button>
            <button
              className="btn btn-xs btn-outline-danger"
              onClick={onDelete}
              title="Xóa"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
