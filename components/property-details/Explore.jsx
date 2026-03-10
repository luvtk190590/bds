import Image from "next/image";
import React from "react";

export default function Explore() {
  return (
    <>
      <h5 className="title fw-6">Explore Property</h5>
      <div className="box-img">
        <Image
          alt="img"
          src="/images/banner/img-explore.jpg"
          width={812}
          height={457}
        />
        <div className="box-icon">
          <span className="icon icon-360" />
        </div>
      </div>
    </>
  );
}
