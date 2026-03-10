"use client";
import { testimonialData } from "@/data/testimonials";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
export default function Testimonials2({ parentClass = "flat-section" }) {
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="box-title px-15">
          <div className="text-center wow fadeInUp">
            <div className="text-subtitle text-primary">Our Testimonials</div>
            <h3 className="title mt-4">What’s people say’s</h3>
            <p className="desc text-variant-1">
              Our seasoned team excels in real estate with years of successful
              market navigation, offering informed decisions and optimal
              results.
            </p>
          </div>
        </div>
        <Swiper
          className="swiper tf-sw-testimonial wow fadeInUp"
          data-wow-delay=".2s"
          slidesPerView={4.5} // Default for larger screens
          centeredSlides={true}
          loop={true}
          spaceBetween={30}
          breakpoints={{
            0: {
              slidesPerView: 1, // Mobile
              spaceBetween: 15,
            },
            480: {
              slidesPerView: 1, // Mobile small
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 2, // Tablet
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3, // Default preview
              spaceBetween: 30,
            },
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb6" }}
        >
          {testimonialData.map(
            ({
              id,
              quote,
              avatarSrc,
              avatarAlt,
              name,
              position,
              stars,
              avatarSize,
            }) => (
              <SwiperSlide className="swiper-slide" key={id}>
                <div className="box-tes-item style-2">
                  <span className="icon icon-quote" />
                  <p className="note body-2">"{quote}"</p>
                  <div className="box-avt d-flex align-items-center gap-12">
                    <div className={`avatar avt-${avatarSize} round`}>
                      <Image
                        alt={avatarAlt}
                        src={avatarSrc}
                        width={avatarSize}
                        height={avatarSize}
                      />
                    </div>
                    <div className="info">
                      <h6>{name}</h6>
                      <p className="caption-2 text-variant-1 mt-4">
                        {position}
                      </p>
                      <ul className="list-star">
                        {[...Array(stars)].map((_, index) => (
                          <li key={index} className="icon icon-star" />
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          )}
          <div className="sw-pagination spb6 sw-pagination-testimonial text-center" />
        </Swiper>
      </div>
    </section>
  );
}
