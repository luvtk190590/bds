"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Navigation, Pagination } from "swiper/modules";
import { Gallery, Item } from "react-photoswipe-gallery";
const images = [
  {
    src: "/images/slider/baner-single-1.jpg",
    alt: "img-property",
  },
  {
    src: "/images/slider/baner-single-2.jpg",
    alt: "img-property",
  },
];

export default function Slider2() {
  return (
    <section className="flat-slider-detail-v2 flat-slider-wrap">
      <Gallery>
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true, el: ".spb19" }}
          className="swiper tf-sw-location"
          navigation={{
            prevEl: ".pnbp1",
            nextEl: ".pnbn1",
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Item
                original={image.src}
                thumbnail={image.src}
                width={1920}
                height={701}
              >
                {({ ref, open }) => (
                  <a
                    data-fancybox="gallery"
                    onClick={open}
                    className="box-img-detail d-block"
                  >
                    <Image
                      ref={ref}
                      alt={image.alt}
                      src={image.src}
                      width={1920}
                      height={701}
                    />
                  </a>
                )}
              </Item>
            </SwiperSlide>
          ))}
          <div className="box-navigation">
            <div className="navigation swiper-nav-next nav-next-location pnbp1">
              <span className="icon icon-arr-l" />
            </div>
            <div className="navigation swiper-nav-prev nav-prev-location pnbn1">
              <span className="icon icon-arr-r" />
            </div>
          </div>
          <div className="sw-pagination spb19 sw-pagination-location text-center" />
        </Swiper>{" "}
      </Gallery>
    </section>
  );
}
