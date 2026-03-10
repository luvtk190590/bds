import React from "react";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/services";
export default function Services() {
  return (
    <section className="flat-spacing-service bg-primary-new">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Our Services</div>
          <h3 className="mt-4 title">Welcome the HomeLengo</h3>
        </div>
        <div
          className="tf-grid-layout md-col-3 wow fadeInUp"
          data-wow-delay=".2s"
        >
          {services.map((elm, i) => (
            <div key={i} className="box-service border-0">
              <div className="image">
                <Image
                  className="lazyload"
                  alt="image-location"
                  width={204}
                  height={182}
                  src={elm.imageSrc}
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
