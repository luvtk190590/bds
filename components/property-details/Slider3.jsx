"use client";

import { useState } from "react";
import { Autoplay, EffectFade, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
export default function Slider3() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const images = [
    {
      src: "/images/banner/banner-property-12.jpg",
      alt: "images",
      width: 1291,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-11.jpg",
      alt: "images",
      width: 1290,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-10.jpg",
      alt: "images",
      width: 1290,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-13.jpg",
      alt: "images",
      width: 1291,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-10.jpg",
      alt: "images",
      width: 1290,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-11.jpg",
      alt: "images",
      width: 1290,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-10.jpg",
      alt: "images",
      width: 1290,
      height: 680,
    },
    {
      src: "/images/banner/banner-property-13.jpg",
      alt: "images",
      width: 1291,
      height: 680,
    },
  ];
  const thumbnails = [
    {
      src: "/images/banner/thumb-sw1.jpg",
      alt: "images",
      width: 148,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw2.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw3.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw4.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw5.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw6.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw7.jpg",
      alt: "images",
      width: 149,
      height: 111,
    },
    {
      src: "/images/banner/thumb-sw8.jpg",
      alt: "images",
      width: 148,
      height: 111,
    },
  ];
  const thumbProps = {
    spaceBetween: 14,
    slidesPerView: "auto",
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      375: {
        slidesPerView: 3,
        spaceBetween: 14,
      },
      500: {
        slidesPerView: "auto",
      },
    },
  };
  const props = {
    spaceBetween: 16,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    speed: 500,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
  };

  return (
    <div>
      <div className="container">
        <div className="single-property-gallery">
          <div className="position-relative">
            <Swiper
              modules={[Thumbs, Autoplay, EffectFade, Navigation]}
              thumbs={{ swiper: thumbsSwiper }}
              className="swiper sw-single"
              {...props}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="image-sw-single">
                    <Image
                      alt={image.alt}
                      src={image.src}
                      width={image.width}
                      height={image.height}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="box-navigation">
              <div className="navigation swiper-nav-next nav-next-single">
                <span className="icon icon-arr-l" />
              </div>
              <div className="navigation swiper-nav-prev nav-prev-single">
                <span className="icon icon-arr-r" />
              </div>
            </div>
          </div>
          <Swiper
            {...thumbProps}
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            className="swiper thumbs-sw-pagi"
          >
            {thumbnails.map((thumb, index) => (
              <SwiperSlide key={index}>
                <div className="img-thumb-pagi">
                  <Image
                    alt={thumb.alt}
                    src={thumb.src}
                    width={thumb.width}
                    height={thumb.height}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
