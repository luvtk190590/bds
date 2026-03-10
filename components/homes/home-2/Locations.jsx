import React from "react";
import Image from "next/image";
import Link from "next/link";
import { locations2 } from "@/data/locations";
export default function Locations() {
  return (
    <section className="flat-section flat-location-v2">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Explore Cities</div>
          <h3 className="title mt-4">Our Location For You</h3>
        </div>
        <div className="grid-location wow fadeInUp" data-wow-delay=".2s">
          {locations2.map(({ id, imgSrc, alt, location, properties }) => (
            <a
              key={id}
              href="#"
              className={`item-${id} box-location-v2 hover-img`}
            >
              <div className="box-img img-style">
                <Image
                  className="lazyload"
                  data-src={imgSrc}
                  alt={alt}
                  src={imgSrc}
                  width={450}
                  height={450}
                />
              </div>
              <div className="content">
                <h6 className="link">{location}</h6>
                <p className="mt-4 text-variant-1">{properties}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
