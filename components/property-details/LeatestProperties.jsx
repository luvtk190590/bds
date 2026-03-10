import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";

export default async function LeatestProperties({ excludeId }) {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select(`
      id, title, slug, price, listing_type, area, bedrooms, bathrooms,
      property_images!inner(url, is_primary)
    `)
    .eq("status", "approved")
    .eq("property_images.is_primary", true)
    .neq("id", excludeId ?? "00000000-0000-0000-0000-000000000000")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!properties?.length) return null;

  return (
    <>
      <h5 className="fw-6 title">BĐS mới nhất</h5>
      <ul>
        {properties.map((p) => {
          const img = p.property_images?.[0]?.url || "/images/home/house-1.jpg";
          const href = `/property-details/${p.slug || p.id}`;
          return (
            <li key={p.id} className="latest-property-item">
              <Link href={href} className="images-style">
                <Image
                  alt={p.title}
                  src={img}
                  width={615}
                  height={405}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </Link>
              <div className="content">
                <div className="text-capitalize text-btn">
                  <Link href={href} className="link" title={p.title}>
                    {p.title}
                  </Link>
                </div>
                <ul className="meta-list mt-6">
                  <li className="item">
                    <i className="icon icon-bed" />
                    <span className="text-variant-1">PN:</span>
                    <span className="fw-6">{p.bedrooms ?? 0}</span>
                  </li>
                  <li className="item">
                    <i className="icon icon-bath" />
                    <span className="text-variant-1">VS:</span>
                    <span className="fw-6">{p.bathrooms ?? 0}</span>
                  </li>
                  <li className="item">
                    <i className="icon icon-sqft" />
                    <span className="fw-6">{formatArea(p.area)}</span>
                  </li>
                </ul>
                <div className="mt-10 text-btn">{formatPrice(p.price)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
