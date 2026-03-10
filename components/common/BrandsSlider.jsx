"use client";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { partners } from "@/data/brands";
export default function BrandsSlider() {
  return (
    <Swiper
      className="swiper tf-sw-partner"
      slidesPerView={6} // Default slides per view for large screens
      spaceBetween={15} // Default space between slides
      loop
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      speed={500}
      breakpoints={{
        1024: {
          slidesPerView: 6, // Large screens (Desktop)
          spaceBetween: 30,
        },
        768: {
          slidesPerView: 4, // Tablets
          spaceBetween: 30,
        },
        575: {
          slidesPerView: 3, // Smaller mobile screens
          spaceBetween: 15,
        },
        0: {
          slidesPerView: 2, // Standard mobile screens
          spaceBetween: 15,
        },
      }}
    >
      {partners.map((partner, index) => (
        <SwiperSlide key={index} className="swiper-slide">
          <div className="partner-item">
            <Image
              src={partner.src}
              width={partner.width}
              height={partner.height}
              alt={`Partner ${index + 1}`}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
