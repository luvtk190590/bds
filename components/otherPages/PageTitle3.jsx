import React from "react";
import Link from "next/link";
export default function PageTitle3() {
  return (
    <section
      className="flat-title-page"
      style={{ backgroundImage: "url(/images/page-title/page-title-4.jpg)" }}
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
            <li className="text-white">/ Contact Us</li>
          </ul>
          <h1 className="text-center text-white title">Contact Us</h1>
        </div>
      </div>
    </section>
  );
}
