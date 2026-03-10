import React from "react";
import Link from "next/link";
import Image from "next/image";
import { services } from "@/data/services";
export default function Services() {
  return (
    <section className="flat-section">
      <div className="container">
        <div
          className="box-title text-center wow fadeInUpSmall"
          data-wow-delay=".2s"
          data-wow-duration="2000ms"
        >
          <div className="text-subtitle text-primary">Explore Cities</div>
          <h3 className="title mt-4">Our Location For You</h3>
        </div>
        <div
          className="tf-grid-layout md-col-3 wow fadeInUpSmall"
          data-wow-delay=".4s"
          data-wow-duration="2000ms"
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
                  Learn More <span className="icon icon-arrow-right2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
