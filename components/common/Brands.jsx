import BrandsSlider from "@/components/common/BrandsSlider";
import React from "react";

export default function Brands() {
  return (
    <section className="flat-section pt-0">
      <div className="container2">
        <h6 className="mb-20 text-center text-capitalize text-black-4">
          Trusted by over 150+ major companies
        </h6>
        <BrandsSlider />
      </div>
    </section>
  );
}
