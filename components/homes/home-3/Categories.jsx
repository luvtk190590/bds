"use client";

import { categories2 } from "@/data/categories";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Categories() {
  return (
    <section className="flat-section flat-categories bg-primary-new">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Property Type</div>
          <h3 className="title mt-4">Try Searching For</h3>
        </div>
        <div className="wrap-categories-sw wow fadeInUp" data-wow-delay=".2s">
          <Swiper
            className="swiper tf-sw-categories"
            slidesPerView={6} // data-preview={6}
            spaceBetween={30} // data-space={15}
            breakpoints={{
              1024: {
                slidesPerView: 6,
                spaceBetween: 30, // data-space-lg={30}
              },
              768: {
                slidesPerView: 5, // data-tablet={4}
                spaceBetween: 30, // data-space-md={30}
              },
              640: {
                slidesPerView: 4, // data-mobile-sm={3}
              },
              0: {
                slidesPerView: 2, // data-mobile={2}
              },
            }}
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".spb13" }}
          >
            {categories2.map((category, index) => (
              <SwiperSlide className="swiper-slide" key={index}>
                <a href="#" className="homelengo-categories style-02">
                  <div className="icon-box">
                    <span className={`icon ${category.iconClass}`} />
                  </div>
                  <div className="content text-center">
                    <h6>{category.title}</h6>
                    <p className="mt-4 text-variant-1">
                      {category.propertyCount}
                    </p>
                  </div>
                </a>
              </SwiperSlide>
            ))}
            <div className="sw-pagination spb13 sw-pagination-category text-center" />
          </Swiper>
        </div>
      </div>
    </section>
  );
}
