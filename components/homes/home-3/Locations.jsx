"use client";
import Image from "next/image";
import Link from "next/link";
import { locations3 } from "@/data/locations";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
export default function Locations() {
  return (
    <section
      className="flat-section"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Explore Cities</div>
          <h3 className="mt-4 title">Properties By Cities</h3>
        </div>
        <div
          className="wow fadeInUp swiper tf-sw-mobile sw-over non-swiper-on-575"
          data-screen={575}
          data-preview={1}
          data-space={15}
          data-wow-delay=".2s"
        >
          <div className="tf-layout-mobile-sm sm-col-2 lg-col-3 swiper-wrapper">
            {locations3.map((location, index) => (
              <div
                key={index}
                className={`swiper-slide ${location.isActive ? "active" : ""}`}
              >
                <div className="box-location-v3 hover-img not-overlay hover-btn-view">
                  <div className="img-style">
                    <Image
                      alt="image-location"
                      src={location.imgSrc}
                      width={380}
                      height={296}
                    />
                  </div>
                  <div className="content">
                    <h6>
                      <Link href={`/topmap-list`} className="link">
                        {location.name}
                      </Link>
                    </h6>
                    <p className="mt-4">{location.properties}</p>
                    <Link href={`/topmap-list`} className="btn-view style-1">
                      <span className="text">Explore Now</span>
                      <span className="icon icon-arrow-right2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sw-pagination sw-pagination-mb text-center d-sm-none d-block" />
          <div className="sec-btn text-center">
            <Link
              href={`/topmap-list`}
              className="tf-btn btn-view primary size-1 hover-btn-view"
            >
              View All Cities <span className="icon icon-arrow-right2" />
            </Link>
          </div>
        </div>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          className="wow fadeInUp swiper tf-sw-mobile sw-over swiper-on-575"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb35" }}
        >
          {locations3.map((location, index) => (
            <SwiperSlide
              key={index}
              className={`swiper-slide ${location.isActive ? "active" : ""}`}
            >
              <div className="box-location-v3 hover-img not-overlay hover-btn-view">
                <div className="img-style">
                  <Image
                    alt="image-location"
                    src={location.imgSrc}
                    width={380}
                    height={296}
                  />
                </div>
                <div className="content">
                  <h6>
                    <Link href={`/topmap-list`} className="link">
                      {location.name}
                    </Link>
                  </h6>
                  <p className="mt-4">{location.properties}</p>
                  <Link href={`/topmap-list`} className="btn-view style-1">
                    <span className="text">Explore Now</span>
                    <span className="icon icon-arrow-right2" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div className="sw-pagination spb35 sw-pagination-mb text-center d-sm-none d-block" />
          <div className="sec-btn text-center">
            <Link
              href={`/topmap-list`}
              className="tf-btn btn-view primary size-1 hover-btn-view"
            >
              View All Cities <span className="icon icon-arrow-right2" />
            </Link>
          </div>
        </Swiper>
      </div>
    </section>
  );
}
