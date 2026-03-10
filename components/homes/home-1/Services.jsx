import React from "react";
import Link from "next/link";
import Image from "next/image";
import { services } from "@/data/services";
export default function Services() {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Dịch Vụ Của Chúng Tôi</div>
          <h3 className="mt-4 title">Chúng Tôi Phục Vụ Gì?</h3>
        </div>
        <div
          className="tf-grid-layout md-col-3 wow fadeInUp"
          data-wow-delay=".2s"
        >
          {services.map((elm, i) => (
            <div key={i} className="box-service">
              <div className="image">
                <Image
                  className="lazyload"
                  alt="image-location"
                  src={elm.imageSrc}
                  width={204}
                  height={182}
                />
              </div>
              <div className="content">
                <h5 className="title">{elm.title}</h5>
                <p className="description">{elm.description}</p>
                <Link href={`/sidebar-grid`} className="tf-btn btn-line">
                  Tìm hiểu thêm <span className="icon icon-arrow-right2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
