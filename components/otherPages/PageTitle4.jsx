import React from "react";
import Link from "next/link";
export default function PageTitle4() {
  return (
    <section
      className="flat-title-page"
      style={{ backgroundImage: "url(/images/page-title/page-title-3.jpg)" }}
    >
      <div className="container">
        <div className="breadcrumb-content">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`} className="text-white">
                Home
              </Link>
            </li>
            <li className="text-white">/ Pages</li>
            <li className="text-white">/ FAQs</li>
          </ul>
          <h1 className="text-center text-white title">
            Frequently Asked Questions
          </h1>
        </div>
      </div>
    </section>
  );
}
