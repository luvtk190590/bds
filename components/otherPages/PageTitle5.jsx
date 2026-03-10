import React from "react";
import Link from "next/link";
export default function PageTitle5() {
  return (
    <section
      className="flat-title-page"
      style={{ backgroundImage: "url(/images/page-title/page-title-7.jpg)" }}
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
            <li className="text-white">/ Privacy Policy</li>
          </ul>
          <h1 className="text-center text-white title">Privacy Policy</h1>
        </div>
      </div>
    </section>
  );
}
