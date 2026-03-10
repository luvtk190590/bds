"use client";
import Link from "next/link";
import Image from "next/image";
import { agents3 } from "@/data/agents";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
export default function Agents2() {
  return (
    <section className="flat-section flat-agents">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Our Teams</div>
          <h3 className="title mt-4">Meet Our Agents</h3>
        </div>
        <div className="swiper tf-sw-mobile-1 non-swiper-on-575">
          <div className="tf-layout-mobile-sm xl-col-4 sm-col-2 swiper-wrapper">
            {agents3.map((agent, index) => (
              <div className="swiper-slide" key={index}>
                <div
                  className="box-agent hover-img wow fadeInUp"
                  data-wow-delay={agent.delay}
                >
                  <a href="#" className="box-img img-style">
                    <Image
                      className="lazyload"
                      data-src={agent.imgSrc}
                      alt={`image of ${agent.name}`}
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
                      <p className="text-variant-1">{agent.role}</p>
                    </div>
                    <div className="box-icon">
                      <span className="icon icon-phone" />
                      <span className="icon icon-mail" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sw-pagination sw-pagination-mb-1 text-center d-sm-none d-block" />
        </div>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          className="swiper tf-sw-mobile-1 swiper-on-575"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb3" }}
        >
          {agents3.map((agent, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div
                className="box-agent hover-img wow fadeInUp"
                data-wow-delay={agent.delay}
              >
                <a href="#" className="box-img img-style">
                  <Image
                    className="lazyload"
                    data-src={agent.imgSrc}
                    alt={`image of ${agent.name}`}
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
                    <p className="text-variant-1">{agent.role}</p>
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
        <p className="text-center desc body-2 text-variant-3">
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
