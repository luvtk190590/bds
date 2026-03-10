"use client";
import { agents } from "@/data/agents";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
export default function Agents() {
  return (
    <section className="flat-section flat-agents">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Đội Ngũ Của Chúng Tôi</div>
          <h3 className="title mt-4">Gặp Gỡ Các Chuyên Viên</h3>
        </div>
        <div className="swiper tf-sw-mobile-1 non-swiper-on-575">
          <div className="tf-layout-mobile-sm xl-col-4 sm-col-2 swiper-wrapper">
            {agents.map((agent) => (
              <SwiperSlide key={agent.id} className="swiper-slide">
                <div
                  className="box-agent hover-img wow fadeInUp"
                  style={{ animationDelay: agent.wowDelay }} // WOW.js animation delay
                >
                  <a href="#" className="box-img img-style">
                    <Image
                      className="lazyload"
                      data-src={agent.imgSrc}
                      alt={`image-agent-${agent.name}`}
                      src={agent.imgSrc}
                      width={450}
                      height={450}
                    />
                    <ul className="agent-social">
                      <li>
                        <span className="icon icon-facebook" />
                      </li>
                      <li>
                        <span className="icon icon-x" />
                      </li>
                      <li>
                        <span className="icon icon-linkedin" />
                      </li>
                      <li>
                        <span className="icon icon-instargram" />
                      </li>
                    </ul>
                  </a>
                  <div className="content">
                    <div className="info">
                      <h5>
                        <a className="link" href="#">
                          {agent.name}
                        </a>
                      </h5>
                      <p className="text-variant-1">{agent.position}</p>
                    </div>
                    <div className="box-icon">
                      <span className="icon icon-phone" />
                      <span className="icon icon-mail" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </div>
          <div className="sw-pagination spb3 sw-pagination-mb-1 text-center d-sm-none d-block" />
        </div>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          className="swiper tf-sw-mobile-1 swiper-on-575"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb3" }}
        >
          {agents.map((agent) => (
            <SwiperSlide key={agent.id} className="swiper-slide">
              <div
                className="box-agent hover-img wow fadeInUp"
                style={{ animationDelay: agent.wowDelay }} // WOW.js animation delay
              >
                <a href="#" className="box-img img-style">
                  <Image
                    className="lazyload"
                    data-src={agent.imgSrc}
                    alt={`image-agent-${agent.name}`}
                    src={agent.imgSrc}
                    width={450}
                    height={450}
                  />
                  <ul className="agent-social">
                    <li>
                      <span className="icon icon-facebook" />
                    </li>
                    <li>
                      <span className="icon icon-x" />
                    </li>
                    <li>
                      <span className="icon icon-linkedin" />
                    </li>
                    <li>
                      <span className="icon icon-instargram" />
                    </li>
                  </ul>
                </a>
                <div className="content">
                  <div className="info">
                    <h5>
                      <a className="link" href="#">
                        {agent.name}
                      </a>
                    </h5>
                    <p className="text-variant-1">{agent.position}</p>
                  </div>
                  <div className="box-icon">
                    <span className="icon icon-phone" />
                    <span className="icon icon-mail" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="sw-pagination spb3 sw-pagination-mb-1 text-center d-sm-none d-block" />
        </Swiper>
      </div>
    </section>
  );
}
