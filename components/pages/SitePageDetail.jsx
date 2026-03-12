import Sidebar from "@/components/blogs/Sidebar";
import Link from "next/link";

export default function SitePageDetail({ page }) {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="row">
          {/* ── Main content ── */}
          <div className="col-lg-8">
            <div className="flat-blog-detail">
              <div className="mb-30 pb-30 line-b">
                <h3 className="title fw-8">{page.title}</h3>
                <ul className="meta-blog">
                  <li className="item">
                    <svg className="icon" width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 2V3.5M11.5 2V3.5M2 12.5V5C2 4.60218 2.15804 4.22064 2.43934 3.93934C2.72064 3.65804 3.10218 3.5 3.5 3.5H12.5C12.8978 3.5 13.2794 3.65804 13.5607 3.93934C13.842 4.22064 14 4.60218 14 5V12.5M2 12.5C2 12.8978 2.15804 13.2794 2.43934 13.5607C2.72064 13.842 3.10218 14 3.5 14H12.5C12.8978 14 13.2794 13.842 13.5607 13.5607C13.842 13.2794 14 12.8978 14 12.5M2 12.5V7.5C2 7.10218 2.15804 6.72064 2.43934 6.43934C2.72064 6.15804 3.10218 6 3.5 6H12.5C12.8978 6 13.2794 6.15804 13.5607 6.43934C13.842 6.72064 14 7.10218 14 7.5V12.5" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-variant-1">
                      {new Date(page.updated_at || page.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </li>
                  {page.excerpt && (
                    <li className="item">
                      <span className="text-variant-1">{page.excerpt}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="pb-30 line-b blog-content">
                {page.content ? (
                  <div
                    className="post-content"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                ) : (
                  <p className="text-variant-1">Trang này chưa có nội dung.</p>
                )}
              </div>

              {/* Breadcrumb bottom */}
              <div className="mt-16 d-flex align-items-center gap-8" style={{ fontSize: 14, color: "#94a3b8" }}>
                <Link href="/" className="text-primary">Trang chủ</Link>
                <span>/</span>
                <span>{page.title}</span>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="col-lg-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
