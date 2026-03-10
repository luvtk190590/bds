import React from "react";
import Link from "next/link";
import Image from "next/image";
export default function Banner() {
  return (
    <section className="flat-section pt-0 flat-banner">
      <div className="container">
        <div className="wrap-banner bg-primary-new">
          <div className="box-left">
            <div className="box-title">
              <div className="text-subtitle text-primary">Become Partners</div>
              <h3 className="mt-4 fw-8">
                List your Properties on Homelengo, join Us Now!
              </h3>
            </div>
            <Link
              href={`/contact`}
              className="tf-btn btn-view primary size-1 hover-btn-view"
            >
              Become A Hosting <span className="icon icon-arrow-right2" />
            </Link>
          </div>
          <div className="box-right">
            <Image
              alt="image"
              src="/images/banner/banner.png"
              width={748}
              height={380}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
