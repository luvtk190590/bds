"use client";
import { useMemo } from "react";

const MAX_TITLE = 60;
const MAX_DESC = 160;
const MIN_CONTENT_WORDS = 300;
const MIN_KEYWORD_DENSITY = 0.5; // %
const MAX_KEYWORD_DENSITY = 3.0; // %

function countWords(text) {
  if (!text) return 0;
  return text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function getPlainText(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function keywordDensity(text, keyword) {
  if (!keyword || !text) return 0;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const kw = keyword.toLowerCase();
  const count = words.filter(w => w.includes(kw)).length;
  return words.length ? (count / words.length) * 100 : 0;
}

export function computeSeoScore({ title, seoTitle, seoDescription, focusKeyword, content, slug }) {
  const checks = [];
  const plain = getPlainText(content);
  const words = countWords(plain);
  const kwDensity = keywordDensity(plain, focusKeyword);
  const sTitle = seoTitle || title || "";
  const sDesc = seoDescription || "";

  // 1. Focus keyword set
  checks.push({
    pass: !!focusKeyword,
    label: focusKeyword ? "Focus keyword đã được đặt" : "Chưa đặt focus keyword",
    weight: 10,
  });

  // 2. Keyword in SEO title
  const kwInTitle = focusKeyword && sTitle.toLowerCase().includes(focusKeyword.toLowerCase());
  checks.push({
    pass: kwInTitle,
    label: kwInTitle ? "Focus keyword có trong tiêu đề SEO" : "Focus keyword chưa có trong tiêu đề SEO",
    weight: 15,
  });

  // 3. Keyword in meta description
  const kwInDesc = focusKeyword && sDesc.toLowerCase().includes(focusKeyword.toLowerCase());
  checks.push({
    pass: kwInDesc,
    label: kwInDesc ? "Focus keyword có trong mô tả meta" : "Focus keyword chưa có trong mô tả meta",
    weight: 10,
  });

  // 4. Keyword in slug
  const kwInSlug = focusKeyword && slug?.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, "-"));
  checks.push({
    pass: kwInSlug,
    label: kwInSlug ? "Focus keyword có trong URL slug" : "Focus keyword chưa có trong URL slug",
    weight: 8,
  });

  // 5. SEO title length
  const titleOk = sTitle.length >= 30 && sTitle.length <= MAX_TITLE;
  checks.push({
    pass: titleOk,
    warn: sTitle.length === 0,
    label: titleOk
      ? `Tiêu đề SEO có độ dài tốt (${sTitle.length} ký tự)`
      : sTitle.length < 30
        ? `Tiêu đề SEO quá ngắn (${sTitle.length}/${MAX_TITLE})`
        : `Tiêu đề SEO quá dài (${sTitle.length}/${MAX_TITLE})`,
    weight: 10,
  });

  // 6. Meta description length
  const descOk = sDesc.length >= 70 && sDesc.length <= MAX_DESC;
  checks.push({
    pass: descOk,
    warn: sDesc.length === 0,
    label: descOk
      ? `Mô tả meta tốt (${sDesc.length} ký tự)`
      : sDesc.length < 70
        ? `Mô tả meta quá ngắn (${sDesc.length}/${MAX_DESC})`
        : `Mô tả meta quá dài (${sDesc.length}/${MAX_DESC})`,
    weight: 12,
  });

  // 7. Content length
  const contentOk = words >= MIN_CONTENT_WORDS;
  checks.push({
    pass: contentOk,
    label: contentOk
      ? `Nội dung đủ dài (${words} từ)`
      : `Nội dung quá ngắn (${words}/${MIN_CONTENT_WORDS} từ)`,
    weight: 15,
  });

  // 8. Keyword density
  const densityOk = focusKeyword && kwDensity >= MIN_KEYWORD_DENSITY && kwDensity <= MAX_KEYWORD_DENSITY;
  const densityWarn = focusKeyword && kwDensity > MAX_KEYWORD_DENSITY;
  checks.push({
    pass: densityOk,
    warn: densityWarn,
    label: !focusKeyword
      ? "Chưa có focus keyword để kiểm tra mật độ"
      : densityOk
        ? `Mật độ keyword tốt (${kwDensity.toFixed(1)}%)`
        : densityWarn
          ? `Keyword density quá cao (${kwDensity.toFixed(1)}%) — tránh spam`
          : `Mật độ keyword thấp (${kwDensity.toFixed(1)}%) — mục tiêu ${MIN_KEYWORD_DENSITY}-${MAX_KEYWORD_DENSITY}%`,
    weight: 10,
  });

  // 9. Keyword in first paragraph
  const firstPara = plain.split(/\n|\./)[0] || "";
  const kwInFirst = focusKeyword && firstPara.toLowerCase().includes(focusKeyword.toLowerCase());
  checks.push({
    pass: kwInFirst,
    label: kwInFirst ? "Focus keyword xuất hiện trong đoạn đầu" : "Focus keyword chưa xuất hiện trong đoạn đầu",
    weight: 10,
  });

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const score = Math.round(checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0) / totalWeight * 100);

  return { checks, score };
}

export function computeReadability({ content }) {
  const plain = getPlainText(content);
  const sentences = plain.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = plain.split(/\s+/).filter(Boolean);
  const avgWordsPerSentence = sentences.length ? words.length / sentences.length : 0;

  const paragraphs = (content || "").split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim());
  const longParas = paragraphs.filter(p => getPlainText(p).split(/\s+/).length > 150);
  const hasH2 = /<h[23]/i.test(content || "");
  const hasPassive = /\b(được|bị|do|bởi)\b/i.test(plain);
  const hasTransitions = /\b(tuy nhiên|mặt khác|vì vậy|do đó|ngoài ra|hơn nữa|đồng thời)\b/i.test(plain);

  return [
    {
      pass: avgWordsPerSentence <= 20,
      warn: avgWordsPerSentence > 25,
      label: avgWordsPerSentence <= 20
        ? `Câu văn có độ dài vừa phải (tb ${avgWordsPerSentence.toFixed(0)} từ/câu)`
        : `Câu văn quá dài (tb ${avgWordsPerSentence.toFixed(0)} từ/câu) — mục tiêu ≤20`,
    },
    {
      pass: longParas.length === 0,
      label: longParas.length === 0
        ? "Độ dài đoạn văn phù hợp"
        : `${longParas.length} đoạn quá dài (>150 từ) — hãy chia nhỏ`,
    },
    {
      pass: hasH2,
      label: hasH2 ? "Có sử dụng tiêu đề phụ (H2/H3)" : "Chưa có tiêu đề phụ H2/H3 — nên thêm vào",
    },
    {
      pass: !hasPassive,
      warn: hasPassive,
      label: hasPassive ? "Có sử dụng câu bị động — cân nhắc dùng câu chủ động" : "Ít câu bị động — tốt",
    },
    {
      pass: hasTransitions,
      label: hasTransitions ? "Có dùng từ liên kết chuyển tiếp" : "Nên thêm từ liên kết (tuy nhiên, ngoài ra...)",
    },
  ];
}

function SeoScoreCircle({ score }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const statusLabel = score >= 70 ? "Tốt" : score >= 40 ? "Trung bình" : "Cần cải thiện";
  const statusClass = score >= 70 ? "good" : score >= 40 ? "average" : "poor";

  return (
    <div className="seo-score-card">
      <div className="seo-score-circle">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="45" cy="45" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="score-number">{score}</div>
      </div>
      <div className="seo-score-label">Điểm SEO</div>
      <div className={`seo-score-status ${statusClass}`}>{statusLabel}</div>
    </div>
  );
}

export default function SeoPanel({ form, setForm, title, slug, content }) {
  const { checks, score } = useMemo(() => computeSeoScore({
    title,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    focusKeyword: form.focusKeyword,
    content,
    slug,
  }), [form.seoTitle, form.seoDescription, form.focusKeyword, title, content, slug]);

  const readability = useMemo(() => computeReadability({ content }), [content]);

  const seoTitleLen = (form.seoTitle || title || "").length;
  const seoDescLen = (form.seoDescription || "").length;
  const siteDomain = typeof window !== "undefined" ? window.location.host : "homelengo.vn";
  const previewTitle = form.seoTitle || title || "Tiêu đề bài viết";
  const previewDesc = form.seoDescription || "Mô tả meta sẽ xuất hiện ở đây khi bài viết được hiển thị trên Google...";

  return (
    <div className="seo-panel">
      {/* Score */}
      <div className="seo-score-card">
        <SeoScoreCircle score={score} />
        <ul className="seo-checks-list">
          {checks.map((c, i) => (
            <li key={i}>
              <span className={`check-icon ${c.pass ? "pass" : c.warn ? "warn" : "fail"}`}>
                {c.pass ? "✓" : c.warn ? "⚠" : "✗"}
              </span>
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Focus keyword */}
      <div className="seo-field-group">
        <div className="sfg-header">Focus Keyword</div>
        <div className="sfg-body">
          <div>
            <label>Từ khóa trọng tâm</label>
            <input
              type="text"
              placeholder="vd: nhà đất hà nội"
              value={form.focusKeyword || ""}
              onChange={e => setForm(f => ({ ...f, focusKeyword: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* SEO fields */}
      <div className="seo-field-group">
        <div className="sfg-header">Thẻ meta SEO</div>
        <div className="sfg-body">
          <div>
            <label>Tiêu đề SEO (meta title)</label>
            <input
              type="text"
              placeholder={title || "Tiêu đề cho Google..."}
              value={form.seoTitle || ""}
              onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
            />
            <div className={`char-count ${seoTitleLen > MAX_TITLE ? "over" : seoTitleLen > 50 ? "warn" : ""}`}>
              {seoTitleLen}/{MAX_TITLE}
            </div>
          </div>
          <div>
            <label>Mô tả meta</label>
            <textarea
              placeholder="Mô tả ngắn gọn cho Google (70–160 ký tự)..."
              value={form.seoDescription || ""}
              onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))}
            />
            <div className={`char-count ${seoDescLen > MAX_DESC ? "over" : seoDescLen > 140 ? "warn" : ""}`}>
              {seoDescLen}/{MAX_DESC}
            </div>
          </div>
          <div>
            <label>Từ khóa (SEO keywords)</label>
            <input
              type="text"
              placeholder="từ khóa 1, từ khóa 2, ..."
              value={form.seoKeywords || ""}
              onChange={e => setForm(f => ({ ...f, seoKeywords: e.target.value }))}
            />
          </div>
          <div>
            <label>Canonical URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.canonicalUrl || ""}
              onChange={e => setForm(f => ({ ...f, canonicalUrl: e.target.value }))}
            />
          </div>
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={form.noIndex || false}
              onChange={e => setForm(f => ({ ...f, noIndex: e.target.checked }))}
            />
            <span className="switch-track" />
            <span className="switch-label">No-index (ẩn khỏi Google)</span>
          </label>
        </div>
      </div>

      {/* SERP Preview */}
      <div className="serp-preview">
        <div className="serp-header">Xem trước Google SERP</div>
        <div className="serp-body">
          <div className="serp-url">{siteDomain} › blogs › {slug || "url-bai-viet"}</div>
          <div className="serp-title">{previewTitle}</div>
          <div className="serp-description">{previewDesc}</div>
        </div>
      </div>

      {/* Social OG */}
      <div className="seo-field-group">
        <div className="sfg-header">Mạng xã hội (OG Tags)</div>
        <div className="sfg-body">
          <div>
            <label>OG Title</label>
            <input
              type="text"
              placeholder={previewTitle}
              value={form.ogTitle || ""}
              onChange={e => setForm(f => ({ ...f, ogTitle: e.target.value }))}
            />
          </div>
          <div>
            <label>OG Description</label>
            <textarea
              placeholder={previewDesc}
              value={form.ogDescription || ""}
              onChange={e => setForm(f => ({ ...f, ogDescription: e.target.value }))}
            />
          </div>
          <div>
            <label>OG Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.ogImage || ""}
              onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
            />
          </div>
          {/* OG preview */}
          <div className="og-preview">
            <div className="og-image">
              {form.ogImage
                ? <img src={form.ogImage} alt="" onError={e => { e.target.style.display = "none"; }} />
                : <span>Chưa có ảnh OG</span>
              }
            </div>
            <div className="og-content">
              <div className="og-domain">{siteDomain}</div>
              <div className="og-title">{form.ogTitle || previewTitle}</div>
              <div className="og-desc">{form.ogDescription || previewDesc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Readability */}
      <div className="seo-field-group">
        <div className="sfg-header">Khả năng đọc (Readability)</div>
        <div className="sfg-body">
          <ul className="readability-list">
            {readability.map((r, i) => (
              <li key={i}>
                <span className={`rd-dot ${r.pass ? "pass" : r.warn ? "warn" : "fail"}`} />
                {r.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
