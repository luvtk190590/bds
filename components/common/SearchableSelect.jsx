"use client";
import { useState, useRef, useEffect, useMemo } from "react";

/**
 * SearchableSelect — dropdown có ô tìm kiếm bên trong
 *
 * Props:
 *   value        — giá trị đang chọn (string | null)
 *   onChange     — callback(value: string | null)
 *   options      — [{ code, name }] hoặc tuỳ chỉnh qua valueKey/labelKey
 *   placeholder  — text khi chưa chọn
 *   searchPlaceholder — placeholder ô tìm kiếm
 *   valueKey     — key dùng làm value (default: "code")
 *   labelKey     — key dùng làm label  (default: "name")
 *   className    — class thêm vào wrapper
 *   disabled     — disable khi options rỗng
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  valueKey = "code",
  labelKey = "name",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef();
  const searchRef = useRef();
  const listRef = useRef();

  const selected = options.find((o) => String(o[valueKey]) === String(value));

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => o[labelKey].toLowerCase().includes(q));
  }, [options, search, labelKey]);

  // Focus search input khi mở
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
      // Scroll selected item vào view
      const selectedEl = listRef.current?.querySelector(".ss-item.selected");
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [open]);

  // Đóng khi click bên ngoài
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function select(val) {
    onChange(val);
    setOpen(false);
    setSearch("");
  }

  return (
    <div
      ref={wrapRef}
      className={`searchable-select${open ? " ss-open" : ""}${disabled ? " ss-disabled" : ""} ${className}`}
    >
      {/* Trigger */}
      <button
        type="button"
        className="ss-trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className={selected ? "ss-value" : "ss-value ss-placeholder"}>
          {selected ? selected[labelKey] : placeholder}
        </span>
        <span className="ss-arrow" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="ss-dropdown">
          {/* Search */}
          <div className="ss-search-wrap">
            <i className="icon icon-search ss-search-icon" />
            <input
              ref={searchRef}
              type="text"
              className="ss-search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="ss-search-clear" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          {/* List */}
          <ul ref={listRef} className="ss-list">
            {/* Option trống (bỏ chọn) */}
            <li
              className={`ss-item ss-item-empty${!value ? " selected" : ""}`}
              onClick={() => select(null)}
            >
              {placeholder}
            </li>

            {filtered.length === 0 ? (
              <li className="ss-item ss-no-result">Không tìm thấy kết quả</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o[valueKey]}
                  className={`ss-item${String(o[valueKey]) === String(value) ? " selected" : ""}`}
                  onClick={() => select(o[valueKey])}
                >
                  {o[labelKey]}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
