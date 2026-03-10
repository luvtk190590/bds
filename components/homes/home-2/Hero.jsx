"use client";
import FilterTab from "@/components/common/FilterTab";
import TyperComponent from "@/components/common/Typer";
import { sliderImages } from "@/data/heroSlides";
import React from "react";
import Image from "next/image";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Hero() {
  return (
    <section className="flat-slider home-2 bg-primary-new">
      <div className="container relative">
        <div className="row">
          <div className="col-xl-10">
            <div className="slider-content">
              <div className="heading">
                <h1 className="fw-8 title animationtext clip">
                  Find A Home That
                  <br />
                  <TyperComponent
                    strings={["Fits Perfectly", "Fits Dream Home"]}
                  />
                </h1>
                <p
                  className="subtitle body-2 wow fadeInUp"
                  data-wow-delay=".2s"
                >
                  We are a real estate agency that will help you find the best{" "}
                  <br />
                  residence you dream of.
                </p>
              </div>

              <FilterTab tabClass="nav-tab-form style-2" styleClass="style-2" />
              <div className="wrap-search-link">
                <p className="body-2">What are you looking for:</p>
                <div className="categories-list">
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
        </div>
      </div>
      <div className="img-banner-left">
        <Image
          alt="img"
          src="/images/slider/graplic-slider-2.png"
          width={412}
          height={187}
        />
      </div>
      <div className="img-banner-right">
        <Swiper
          effect="fade"
          modules={[EffectFade, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={500}
          className="swiper slider-sw-home2"
        >
          {sliderImages.map((image, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div className={`slider-home2 ${image.className || ""}`}>
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
      </div>
    </section>
  );
}
