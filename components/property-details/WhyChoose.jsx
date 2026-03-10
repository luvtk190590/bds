import React from "react";

export default function WhyChoose() {
  return (
    <>
      {" "}
      <h5 className="title fw-6">Why Choose Us?</h5>
      <ul className="box-whychoose">
        <li className="item-why">
          <i className="icon icon-secure" />
          Secure Booking
        </li>
        <li className="item-why">
          <i className="icon icon-guarantee" />
          Best Price Guarantee
        </li>
        <li className="item-why">
          <i className="icon icon-booking" />
          Easy Booking Process
        </li>
        <li className="item-why">
          <i className="icon icon-support" />
          Available Support 24/7
        </li>
      </ul>
    </>
  );
}
