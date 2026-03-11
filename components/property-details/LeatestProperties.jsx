"use client";

import { useLatestProperties } from "@/lib/hooks/useProperties";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";

export default function LeatestProperties({ excludeId }) {
  const { properties, isLoading } = useLatestProperties(excludeId);

  if (isLoading) return <div className="text-center py-3"><p>Loading...</p></div>;
  if (!properties?.length) return null;

  return (
    <>
      <h5 className="fw-6 title">BĐS mới nhất</h5>
      <ul>
        {properties.map((p) => {
          const img = p.images?.[0]?.url || "/images/home/house-1.jpg";
          const href = `/property-details/${p.slug || p.id}`;
          return (
            <li key={p.id} className="latest-property-item">
              <Link href={href} className="images-style" style={{ display: "block", flexShrink: 0 }}>
                <Image
                  alt={p.title}
                  src={img}
                  fill
                  sizes="112px"
                  style={{ objectFit: "cover" }}
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
