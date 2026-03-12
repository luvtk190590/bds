"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useProperties } from "@/lib/hooks/useProperties";
import { formatPriceWithUnit } from "@/lib/utils/formatters";

export default function Properties2() {
  const { properties, isLoading, error } = useProperties({
    pageSize: 6,
    sortBy: "newest"
  });

  if (isLoading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (error || properties.length === 0) return null;

  const renderPropertyBox = (property) => (
    <div className="homelengo-box">
      <div className="archive-top">
        <Link
          href={`/property-details/${property.slug || property.id}`}
          className="images-group"
        >
          <div className="images-style">
            <Image
              className="lazyload"
              alt={property.title}
              src={property.image_url || "/images/home/house-1.jpg"}
              width={615}
              height={405}
            />
          </div>
          <div className="top">
            <ul className="d-flex gap-6">
              <li className="flag-tag primary">Hot</li>
              <li className={`flag-tag ${property.listing_type === 'sale' ? 'style-1' : 'style-2'}`}>
                {property.listing_type === 'sale' ? 'Bán' : 'Thuê'}
              </li>
            </ul>
          </div>
          <div className="bottom">
            <i className="icon icon-mapPin text-white me-1" />
            {property.address}
          </div>
        </Link>
      </div>
      <div className="archive-bottom">
        <div className="content-top">
          <h6 className="text-capitalize" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '44px',
            lineHeight: '22px',
            marginBottom: '10px',
            wordBreak: 'break-word'
          }}>
            <Link
              href={`/property-details/${property.slug || property.id}`}
              className="link"
            >
              {property.title}
            </Link>
          </h6>
          <ul className="meta-list">
            <li className="item">
              <i className="icon icon-bed" />
              <span className="text-variant-1">P.Ngủ:</span>
              <span className="fw-6">{property.bedrooms}</span>
            </li>
            <li className="item">
              <i className="icon icon-bath" />
              <span className="text-variant-1">P.Tắm:</span>
              <span className="fw-6">{property.bathrooms}</span>
            </li>
            <li className="item">
              <i className="icon icon-sqft" />
              <span className="text-variant-1">DT:</span>
              <span className="fw-6">{property.area} m²</span>
            </li>
          </ul>
        </div>
        <div className="content-bottom">
          <h6 className="price">
            {formatPriceWithUnit(property.price, property.listing_type)}
          </h6>
          <div className="d-flex gap-8 align-items-center">
            <div className="avatar avt-40 round" style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                alt="avt"
                src={property.owner_avatar || "/images/avatar/avt-1.jpg"}
                onError={(e) => { e.currentTarget.src = "/images/avatar/avt-1.jpg" }}
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
            </div>
            <span>{property.owner_name || "Chủ nhà"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="flat-section">
      <div className="container">
        <div className="box-title">
          <div className="text-center wow fadeInUp">
            <div className="text-subtitle text-primary">Bất động sản tốt nhất</div>
            <h3 className="title mt-4">Giá trị tuyệt vời nhất</h3>
          </div>
        </div>
        <div className="swiper tf-sw-mobile non-swiper-on-767">
          <div className="tf-layout-mobile-md xl-col-3 md-col-2 swiper-wrapper">
            {properties.map((property, index) => (
              <div key={index} className="swiper-slide">
                {renderPropertyBox(property)}
              </div>
            ))}
          </div>
          <div className="sw-pagination sw-pagination-mb text-center d-md-none d-block" />
        </div>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          className="swiper tf-sw-mobile swiper-on-767"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb31" }}
        >
          {properties.map((property, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              {renderPropertyBox(property)}
            </SwiperSlide>
          ))}
          <div className="sw-pagination spb31 sw-pagination-mb text-center d-md-none d-block" />
        </Swiper>
        <div className="text-center sec-btn">
          <Link
            href={`/properties-map`}
            className="tf-btn btn-view primary size-1 hover-btn-view"
          >
            Xem tất cả
            <span className="icon icon-arrow-right2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
