"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProperties } from "@/lib/hooks/useProperties";
import { formatPriceWithUnit, formatArea } from "@/lib/utils/formatters";

const filterOptions = ["View All", "Sale", "Rent"];

export default function Properties() {
  const [selectedOption, setSelectedOption] = useState("View All");

  const { properties, isLoading, error } = useProperties({
    filterListing: selectedOption === "Sale" ? "sale" : selectedOption === "Rent" ? "rent" : null,
    pageSize: 6,
    sortBy: "newest"
  });

  return (
    <section className="flat-section flat-recommended">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Bất động sản nổi bật</div>
          <h3 className="mt-4 title">Dành cho bạn</h3>
        </div>
        <div
          className="flat-tab-recommended flat-animate-tab wow fadeInUp"
          data-wow-delay=".2s"
        >
          <ul className="nav-tab-recommended justify-content-md-center">
            {filterOptions.map((option, index) => (
              <li
                onClick={() => setSelectedOption(option)}
                key={index}
                className="nav-tab-item"
              >
                <a
                  className={`nav-link-item ${option === selectedOption ? "active" : ""
                    }`}
                >
                  {option === "View All" ? "Tất cả" : option === "Sale" ? "Mua bán" : "Cho thuê"}
                </a>
              </li>
            ))}
          </ul>
          <div className="tab-content">
            <div className="tab-pane active show">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : error ? (
                <div className="text-center py-5 text-danger">Lỗi tải dữ liệu.</div>
              ) : properties.length === 0 ? (
                <div className="text-center py-5">Không tìm thấy bất động sản nào.</div>
              ) : (
                <div className="row">
                  {properties.map((property, index) => (
                    <div key={index} className="col-xl-4 col-lg-6 col-md-6">
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
                                <li className="flag-tag primary">Mới</li>
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
                                <span className="fw-6">{formatArea(property.area)}</span>
                              </li>
                            </ul>
                          </div>
                          <div className="content-bottom">
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
                            <h6 className="price">
                              {formatPriceWithUnit(property.price, property.listing_type)}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-4">
                <Link
                  href={`/properties-map`}
                  className="tf-btn btn-view primary size-1 hover-btn-view"
                >
                  Xem tất cả
                  <span className="icon icon-arrow-right2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
