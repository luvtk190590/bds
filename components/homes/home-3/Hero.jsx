import FilterTab from "@/components/common/FilterTab";
import FlatFilter2 from "@/components/common/FlatFilter2";
import TyperComponent from "@/components/common/Typer";
import React from "react";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="flat-slider home-3">
      <div className="container position-relative z-1">
        <div className="row position-relative">
          <div className="col-xl-8 col-lg-7">
            <div className="slider-content">
              <div className="heading">
                <div className="title-large title text-white animationtext clip">
                  Indulge in Your
                  <br />
                  <TyperComponent strings={["Sanctuary", "Safe House"]} />
                </div>
                <p
                  className="subtitle text-white body-2 wow fadeInUp"
                  data-wow-delay=".2s"
                >
                  Discover your private oasis at Homelengo, where every corner,
                  from the spacious garden to the relaxing pool, is crafted for
                  your comfort and enjoyment.
                </p>
              </div>
              <Link
                href={`/contact`}
                className="tf-btn btn-view primary size-1 hover-btn-view"
              >
                Contact us <span className="icon icon-arrow-right2"></span>
              </Link>
            </div>
          </div>
          <div className="col-xl-4 col-lg-5">
            <FlatFilter2 />

            <div className="wrap-search-link">
              <div className="categories-list">
                <a href="#">
                  <i className="icon icon-house-fill"></i> Houses
                </a>
                <a href="#">
                  <i className="icon icon-villa-fill"></i> Villa
                </a>
                <a href="#">
                  <i className="icon icon-office-fill"></i> Office
                </a>
                <a href="#">
                  <i className="icon icon-apartment"></i> Apartments
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overlay"></div>
    </section>
  );
}
