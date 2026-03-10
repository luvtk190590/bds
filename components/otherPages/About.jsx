import React from "react";
import Image from "next/image";
import Link from "next/link";
export default function About() {
  return (
    <section className="flat-section">
      <div className="container flat-header-wrapper-about">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h1 className="title">Welcome to the Hom Lengo</h1>
            <p className="text-variant-1 desc">
              Welcome to Home Lengo, where we turn houses into homes and dreams
              into reality. At Home, we understand that a home is more than just
              a physical space, it's a place where memories are created,
              families grow, and life unfolds.
            </p>
            <div className="signature-box">
              <div className="top">
                <h6>Leslie Alexander</h6>
                <p className="text-variant-2">CEO & founder</p>
              </div>
              <Image
                alt=""
                width="211"
                height="116"
                src="/images/banner/signature.png"
              />
            </div>
            <Link
              href={`/contact`}
              className="tf-btn btn-view primary hover-btn-view"
            >
              Contact us
              <span className="icon icon-arrow-right2"></span>
            </Link>
            <div className="box-img item1 ani5">
              <Image
                alt=""
                width="155"
                height="155"
                src="/images/banner/item1.jpg"
              />
            </div>
            <div className="box-img item2 ani4">
              <Image
                alt=""
                width="181"
                height="181"
                src="/images/banner/item2.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
