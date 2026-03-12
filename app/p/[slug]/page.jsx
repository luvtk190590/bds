import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import SitePageDetail from "@/components/pages/SitePageDetail";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateMetadata({ params }) {
  const { data } = await supabase
    .from("site_pages")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!data) return { title: "Trang không tồn tại" };

  return {
    title: data.meta_title || data.title,
    description: data.meta_description || data.excerpt || "",
  };
}

export default async function SitePage({ params }) {
  const { data: pg } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!pg) notFound();

  return (
    <>
      <Header1 />

      {/* Page title banner — giống blog detail */}
      <section
        className="flat-title-page"
        style={{ backgroundImage: "url(/images/page-title/page-title-2.jpg)" }}
      >
        <div className="container">
          <div className="breadcrumb-content">
            <ul className="breadcrumb">
              <li>
                <Link href="/" className="text-white">Trang chủ</Link>
              </li>
              <li className="text-white">/ {pg.title}</li>
            </ul>
            <h1 className="text-center text-white title">{pg.title}</h1>
          </div>
        </div>
      </section>

      {/* Content — layout giống BlogDetails */}
      <SitePageDetail page={pg} />

      <Footer1 />
    </>
  );
}
