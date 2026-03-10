import React from "react";
import Link from "next/link";
import Image from "next/image";
import { properties7 } from "@/data/properties";
export default function TopProperty() {
  return (
    <section className="flat-section">
      <div className="container">
        {properties7.slice(1, 2).map((property) => (
          <div className="flat-img-with-text style-3 bg-primary-new">
            <div className="content-left img-animation wow">
              <Image
                className="lazyload"
                alt=""
                src={property.imgSrc}
                width={945}
                height={657}
              />
            </div>
            <div key={property.id} className="content-right">
              <div className="box-title wow fadeInUp">
                <div className="text-subtitle text-primary">
                  {property.subtitle}
                </div>
                <h3 className="title mt-4">{property.title}</h3>
              </div>
              <div
                className="flat-property-box wow fadeInUp"
                data-wow-delay=".2s"
              >
                <div className="archive-top">
                  <ul className="d-flex gap-6">
                    {property.tags.map((flag, index) => (
                      <li
                        key={index}
                        className={`flag-tag ${
                          flag === "Featured" ? "primary" : "style-1"
                        }`}
                      >
                        {flag}
                      </li>
                    ))}
                  </ul>
                  <h4 className="title">
                    <Link
                      href={`/property-details-v1/${property.id}`}
                      className="link"
                    >
                      {property.title}
                    </Link>
                  </h4>
                  <ul className="meta-list">
                    <li className="item">
                      <i className="icon icon-bed" />
                      <span className="text-variant-1">Beds:</span>
                      <span className="fw-6">{property.beds}</span>
                    </li>
                    <li className="item">
                      <i className="icon icon-bath" />
                      <span className="text-variant-1">Baths:</span>
                      <span className="fw-6">{property.baths}</span>
                    </li>
                    <li className="item">
                      <i className="icon icon-sqft" />
                      <span className="text-variant-1">Sqft:</span>
                      <span className="fw-6">{property.sqft}</span>
                    </li>
                  </ul>
                  <div className="meta-location d-flex gap-4 align-items-center mt-16">
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 7C10 7.53043 9.78929 8.03914 9.41421 8.41421C9.03914 8.78929 8.53043 9 8 9C7.46957 9 6.96086 8.78929 6.58579 8.41421C6.21071 8.03914 6 7.53043 6 7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7Z"
                        stroke="#A3ABB0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 7C13 11.7613 8 14.5 8 14.5C8 14.5 3 11.7613 3 7C3 5.67392 3.52678 4.40215 4.46447 3.46447C5.40215 2.52678 6.67392 2 8 2C9.32608 2 10.5979 2.52678 11.5355 3.46447C12.4732 4.40215 13 5.67392 13 7Z"
                        stroke="#A3ABB0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-variant-1">{property.address}</p>
                  </div>
                  <div className="box-avt">
                    <div className="avatar avt-60">
                      <Image
                        alt="avt"
                        src={property.avatar}
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="content">
                      <p className="caption-1">Agent</p>
                      <h6>{property.agent}</h6>
                    </div>
                  </div>
                </div>
                <div className="archive-bottom">
                  <div>
                    <h4 className="d-inline-block">
                      ${property.price.toLocaleString()}
                    </h4>
                    <span className="body-2 text-variant-1">/month</span>
                  </div>
                  <div className="g-icon">
                    <div className="item-icon">
                      <span className="icon icon-heart" />
                    </div>
                    <div className="item-icon">
                      <span className="icon icon-arrLeftRight" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
