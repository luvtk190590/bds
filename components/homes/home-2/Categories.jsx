"use client";

import { categories } from "@/data/categories";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Categories() {
  return (
    <section className="flat-section flat-categories">
      <div className="container">
        <div className="box-title style-1 wow fadeInUp">
          <div className="text-subtitle text-primary">Property Type</div>
          <h3 className="title mt-4">Try Searching For</h3>
        </div>
        <div className="wrap-categories-sw wow fadeInUp" data-wow-delay=".2s">
          <Swiper
            spaceBetween={30} // data-space-lg and data-space-md
            slidesPerView={6} // data-preview
            breakpoints={{
              1200: {
                slidesPerView: 6,
              },
              1000: {
                slidesPerView: 5,
              },
              768: {
                slidesPerView: 4, // data-tablet
              },
              576: {
                slidesPerView: 3, // data-mobile-sm
              },
              0: {
                slidesPerView: 2, // data-mobile
              },
            }}
            className="swiper tf-sw-categories sw-over"
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".spb9" }}
          >
            {categories.map((category, index) => (
              <SwiperSlide key={index} className="swiper-slide">
                <a href="#" className="homelengo-categories">
                  <div className="icon-box">
                    <span className={`icon ${category.iconClass}`} />
                  </div>
                  <div className="content text-center">
                    <h6>{category.name}</h6>
                    <p className="mt-4 text-variant-1">{category.properties}</p>
                  </div>
                </a>
              </SwiperSlide>
            ))}
            <div className="sw-pagination spb9 sw-pagination-category text-center" />
          </Swiper>
        </div>
      </div>
    </section>
  );
}
