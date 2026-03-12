"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { menuItems as staticMenu } from "@/data/menu";
import { footerSections as staticFooter } from "@/data/footer";

// ── Menu ────────────────────────────────────────────────────────────────────
/**
 * Returns menu items in the same format as data/menu.js:
 * [ { title, links: [{ href, label }] } ]
 */
export function useMenuItems(location = "main") {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    createClient()
      .from("menu_items")
      .select("id, label, url, parent_id, sort_order, open_new_tab")
      .eq("menu_location", location)
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setItems(null); // fallback to static
          return;
        }
        // Build tree: parents + children
        const parents = data.filter(r => !r.parent_id);
        const result = parents.map(p => ({
          title: p.label,
          links: data
            .filter(c => c.parent_id === p.id)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(c => ({ href: c.url || "#", label: c.label, newTab: c.open_new_tab })),
        }));
        setItems(result);
      })
      .catch(() => setItems(null));
  }, [location]);

  // Return DB data or fallback to static data/menu.js
  return items ?? staticMenu;
}

// ── Footer Sections ──────────────────────────────────────────────────────────
/**
 * Returns footer sections with their links, format:
 * [ { heading, links: [{ href, label }] } ]
 */
export function useFooterSections() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    createClient()
      .from("footer_sections")
      .select("id, title, sort_order, footer_links(id, label, url, sort_order, open_new_tab)")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!data || data.length === 0) { setSections(null); return; }
        const result = data.map(s => ({
          heading: s.title,
          links: (s.footer_links || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(l => ({ href: l.url || "#", label: l.label, newTab: l.open_new_tab })),
        }));
        setSections(result);
      })
      .catch(() => setSections(null));
  }, []);

  return sections ?? staticFooter;
}

// ── Site Settings ─────────────────────────────────────────────────────────────
export function useSiteSettings() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(r => { map[r.key] = r.value; });
        setSettings(map);
      })
      .catch(() => {});
  }, []);

  return settings;
}

// ── Property Categories CMS ──────────────────────────────────────────────────
export function usePropertyCategoriesCms() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    createClient()
      .from("property_categories_cms")
      .select("id, name, slug, icon, type_ids, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!data || data.length === 0) { setCategories(null); return; }
        setCategories(
          data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            typeIds: c.type_ids || [],
          }))
        );
      })
      .catch(() => setCategories(null));
  }, []);

  return categories; // null = still loading or empty, use static PROPERTY_CATEGORIES as fallback
}
