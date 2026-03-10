import Image from "next/image";
import React from "react";

export default function FloorPlan() {
  return (
    <>
      <h5 className="title fw-6">Floor plans</h5>
      <ul className="box-floor" id="parent-floor">
        <li className="floor-item">
          <div
            className="floor-header"
            data-bs-target="#floor-one"
            data-bs-toggle="collapse"
            aria-expanded="false"
            aria-controls="floor-one"
          >
            <div className="inner-left">
              <i className="icon icon-arr-r" />
              <span className="text-btn">First Floor</span>
            </div>
            <ul className="inner-right">
              <li className="d-flex align-items-center gap-8">
                <i className="icon icon-bed" />2 Bedroom
              </li>
              <li className="d-flex align-items-center gap-8">
                <i className="icon icon-bath" />2 Bathroom
              </li>
            </ul>
          </div>
          <div
            id="floor-one"
            className="collapse show"
            data-bs-parent="#parent-floor"
          >
            <div className="faq-body">
              <div className="box-img">
                <Image
                  alt="img-floor"
                  src="/images/banner/floor.png"
                  width={1158}
                  height={815}
                />
              </div>
            </div>
          </div>
        </li>
        <li className="floor-item">
          <div
            className="floor-header collapsed"
            data-bs-target="#floor-two"
            data-bs-toggle="collapse"
            aria-expanded="false"
            aria-controls="floor-two"
          >
            <div className="inner-left">
              <i className="icon icon-arr-r" />
              <span className="text-btn">Second Floor</span>
            </div>
            <ul className="inner-right">
              <li className="d-flex align-items-center gap-8">
                <i className="icon icon-bed" />2 Bedroom
              </li>
              <li className="d-flex align-items-center gap-8">
                <i className="icon icon-bath" />2 Bathroom
              </li>
            </ul>
          </div>
          <div
            id="floor-two"
            className="collapse"
            data-bs-parent="#parent-floor"
          >
            <div className="faq-body">
              <div className="box-img">
                <Image
                  alt="img-floor"
                  src="/images/banner/floor.png"
                  width={1158}
                  height={815}
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </>
  );
}
