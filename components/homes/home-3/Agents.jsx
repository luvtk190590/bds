"use client";
import Link from "next/link";
import Image from "next/image";
import { agents2 } from "@/data/agents";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
export default function Agents() {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="box-title style-3 text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Our Teams</div>
          <h3 className="title mt-4">Meet Our Agents</h3>
        </div>
        <div className="swiper tf-sw-mobile-1 non-swiper-on-991">
          <div
            className="swiper-wrapper tf-layout-mobile-lg lg-col-2 wow fadeInUp"
            data-wow-delay=".2s"
          >
            {agents2.map((agent) => (
              <div className="swiper-slide" key={agent.id}>
                <div className="box-agent style-list hover-img hover-btn-view">
                  <a href="#" className="box-img img-style">
                    <Image
                      className="lazyload"
                      data-src={agent.imgSrc}
                      alt="image-agent"
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
                  <div className="archive-content">
                    <div className="top">
                      <h5>
                        <a href="#" className="link">
                          {agent.name}
                        </a>
                      </h5>
                      <p className="mt-4 text-variant-1">{agent.title}</p>
                    </div>
                    <ul className="list-info">
                      <li className="item">
                        <span className="icon icon-phone-line2" />
                        {agent.phone}
                      </li>
                      <li className="item">
                        <span className="icon icon-mail-line" />
                        {agent.email}
                      </li>
                      <li className="item">
                        <span className="icon icon-mapPin" />
                        {agent.address}
                      </li>
                    </ul>
                    <a
                      href="#"
                      className="tf-btn btn-view style-1 primary size-1"
                    >
                      View profile <i className="icon icon-arrow-right2" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sw-pagination sw-pagination-mb-1 text-center d-lg-none d-block" />
        </div>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          className="swiper tf-sw-mobile-1 swiper-on-991"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb33" }}
        >
          {agents2.map((agent) => (
            <SwiperSlide className="swiper-slide" key={agent.id}>
              <div className="box-agent style-list hover-img hover-btn-view">
                <a href="#" className="box-img img-style">
                  <Image
                    className="lazyload"
                    data-src={agent.imgSrc}
                    alt="image-agent"
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
                <div className="archive-content">
                  <div className="top">
                    <h5>
                      <a href="#" className="link">
                        {agent.name}
                      </a>
                    </h5>
                    <p className="mt-4 text-variant-1">{agent.title}</p>
                  </div>
                  <ul className="list-info">
                    <li className="item">
                      <span className="icon icon-phone-line2" />
                      {agent.phone}
                    </li>
                    <li className="item">
                      <span className="icon icon-mail-line" />
                      {agent.email}
                    </li>
                    <li className="item">
                      <span className="icon icon-mapPin" />
                      {agent.address}
                    </li>
                  </ul>
                  <a
                    href="#"
                    className="tf-btn btn-view style-1 primary size-1"
                  >
                    View profile <i className="icon icon-arrow-right2" />
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div className="sw-pagination spb33 sw-pagination-mb-1 text-center d-lg-none d-block" />
        </Swiper>
        <p className="mt-30 text-center desc body-2 text-variant-3">
          Become an agent and get the commission you deserve.
          <Link href={`/contact`} className="text-primary">
            {" "}
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
