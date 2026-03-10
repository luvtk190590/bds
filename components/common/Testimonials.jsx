"use client";
import { testimonialData } from "@/data/testimonials";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
export default function Testimonials() {
  return (
    <section className="flat-section bg-primary-new flat-testimonial">
      <div className="box-title px-15 wow fadeInUp">
        <div
          className="text-center wow fadeInUpSmall"
          data-wow-delay=".2s"
          data-wow-duration="2000ms"
        >
          <div className="text-subtitle text-primary">Nhận Xét Từ Khách Hàng</div>
          <h3 className="title mt-4">Khách Hàng Nói Gì Về Chúng Tôi</h3>
          <p className="desc text-variant-1">
            Khách hàng luôn là trung tâm trong mọi hoạt động của chúng tôi. Những đánh giá chân thực dưới đây là động lực để HomeLengo không ngừng nỗ lực mang lại giá trị tốt nhất.
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
            slidesPerView: 2, // Mobile small
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 3, // Tablet
            spaceBetween: 30,
          },
          1424: {
            slidesPerView: 4.5, // Default preview
            spaceBetween: 30,
          },
        }}
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".spb5" }}
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
              <div className="box-tes-item">
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
                    <p className="caption-2 text-variant-1 mt-4">{position}</p>
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
        <div className="sw-pagination  spb5 sw-pagination-testimonial text-center" />
      </Swiper>
    </section>
  );
}
