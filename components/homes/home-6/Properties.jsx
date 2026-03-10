import PropertyMap from "@/components/common/PropertyMap";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { properties } from "@/data/properties";
export default function Properties() {
  return (
    <section className="wrapper-layout">
      <div className="wrap-left">
        <h4 className="title">Recommended for you</h4>
        <div className="row">
          {properties.slice(0, 6).map((elm, i) => (
            <div key={i} className="col-lg-6 col-md-6">
              <div className="homelengo-box">
                <div className="archive-top">
                  <Link href={`/property-details-v1`} className="images-group">
                    <div className="images-style">
                      <Image
                        className="lazyload"
                        alt="img"
                        src={elm.imgSrc}
                        width={615}
                        height={405}
                      />
                    </div>
                    <div className="top">
                      <ul className="d-flex gap-6">
                        <li className="flag-tag primary">Featured</li>
                        <li className="flag-tag style-1">For Sale</li>
                      </ul>
                    </div>
                    <div className="bottom">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 7C10 7.53043 9.78929 8.03914 9.41421 8.41421C9.03914 8.78929 8.53043 9 8 9C7.46957 9 6.96086 8.78929 6.58579 8.41421C6.21071 8.03914 6 7.53043 6 7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7Z"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13 7C13 11.7613 8 14.5 8 14.5C8 14.5 3 11.7613 3 7C3 5.67392 3.52678 4.40215 4.46447 3.46447C5.40215 2.52678 6.67392 2 8 2C9.32608 2 10.5979 2.52678 11.5355 3.46447C12.4732 4.40215 13 5.67392 13 7Z"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {elm.address}
                    </div>
                  </Link>
                </div>
                <div className="archive-bottom">
                  <div className="content-top">
                    <h6 className="text-capitalize">
                      <Link
                        href={`/property-details-v1/${elm.id}`}
                        className="link"
                      >
                        {elm.title}
                      </Link>
                    </h6>
                    <ul className="meta-list">
                      <li className="item">
                        <i className="icon icon-bed" />
                        <span className="text-variant-1">Beds:</span>
                        <span className="fw-6">{elm.beds}</span>
                      </li>
                      <li className="item">
                        <i className="icon icon-bath" />
                        <span className="text-variant-1">Baths:</span>
                        <span className="fw-6">{elm.baths}</span>
                      </li>
                      <li className="item">
                        <i className="icon icon-sqft" />
                        <span className="text-variant-1">Sqft:</span>
                        <span className="fw-6">{elm.sqft}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="content-bottom">
                    <div className="d-flex gap-8 align-items-center">
                      <div className="avatar avt-40 round">
                        <Image
                          alt="avt"
                          src={elm.avatar}
                          width={34}
                          height={34}
                        />
                      </div>
                      <span>{elm.agent}</span>
                    </div>
                    <h6 className="price">${elm.price.toLocaleString()}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap-right">
        <div id="map" className="top-map">
          <PropertyMap />
        </div>
      </div>
    </section>
  );
}
