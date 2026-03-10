import React from "react";
import Image from "next/image";
import { benefits } from "@/data/benefits";
export default function Benefits() {
  return (
    <section className="mx-5 bg-primary-new radius-30">
      <div className="flat-img-with-text">
        <div className="content-left img-animation wow">
          <Image
            className="lazyload"
            data-src="/images/banner/img-w-text5.jpg"
            alt=""
            width={950}
            height={908}
            src="/images/banner/img-w-text5.jpg"
          />
        </div>
        <div className="content-right">
          <div className="box-title wow fadeInUp">
            <div className="text-subtitle text-primary">Our Benifit</div>
            <h3 className="title mt-4">Why Choose HomeLengo</h3>
            <p className="desc text-variant-1">
              Our seasoned team excels in real estate with years of successful
              market navigation, offering informed decisions and optimal
              results.
            </p>
          </div>
          <div className="flat-service wow fadeInUp" data-wow-delay=".2s">
            {benefits.map((benefit) => (
              <a
                key={benefit.id}
                href="#"
                className="box-benefit hover-btn-view"
              >
                <div className="icon-box">
                  <span className={`icon ${benefit.icon}`} />
                </div>
                <div className="content">
                  <h5 className="title">{benefit.title}</h5>
                  <p className="description">{benefit.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
