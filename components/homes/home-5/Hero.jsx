"use client";
import TyperComponent from "@/components/common/Typer";
import { sliderImages2, sliderThumbnailImages } from "@/data/heroSlides";
import React, { useState } from "react";
import { Autoplay, EffectFade, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
export default function Hero() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const options1 = {
    spaceBetween: 0,
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
  const options2 = {
    spaceBetween: 0,
    slidesPerView: 4,
    freeMode: true,
    direction: "vertical",
    watchSlidesProgress: true,
  };
  return (
    <section className="flat-slider home-5">
      <div className="wrap-slider-swiper">
        <Swiper
          modules={[Thumbs, Autoplay, EffectFade]}
          thumbs={{ swiper: thumbsSwiper }}
          {...options1}
          className="swiper-container thumbs-swiper-column"
        >
          {sliderImages2.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="box-img">
                <Image alt="images" width={1920} height={910} src={src} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="box-content">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="slider-content">
                  <div className="heading">
                    <div
                      className="title-large title text-white wow fadeIn animationtext clip"
                      data-wow-delay=".2s"
                      data-wow-duration="2000ms"
                    >
                      Indulge in Your
                      <br />
                      <TyperComponent strings={["Sanctuary", "Safe House"]} />
                    </div>
                    <p
                      className="subtitle text-white body-2 wow fadeInUp"
                      data-wow-delay=".2s"
                    >
                      Discover your private oasis at Homelengo, where every
                      corner, from the spacious garden to the relaxing pool, is
                      crafted for your comfort and enjoyment.
                    </p>
                  </div>
                  <div className="wrap-search-link">
                    <div className="categories-list style-2">
                      <a href="#">
                        <i className="icon icon-house-fill" /> Houses
                      </a>
                      <a href="#">
                        <i className="icon icon-villa-fill" /> Villa
                      </a>
                      <a href="#">
                        <i className="icon icon-office-fill" /> Office
                      </a>
                      <a href="#">
                        <i className="icon icon-apartment" /> Apartments
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <Swiper
                  {...options2}
                  modules={[Thumbs]}
                  onSwiper={setThumbsSwiper}
                  watchSlidesProgress
                  className="swiper-container thumbs-swiper-column1 swiper-pagination5"
                >
                  {sliderThumbnailImages.map((src, index) => (
                    <SwiperSlide key={index}>
                      <div className="image-detail">
                        <Image
                          alt="images"
                          width={120}
                          height={120}
                          src={src}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overlay" />
    </section>
  );
}
