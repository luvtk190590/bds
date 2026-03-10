"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
import { Gallery, Item } from "react-photoswipe-gallery";
const propertyImages = [
  {
    src: "/images/banner/banner-property-1.jpg",
    alt: "img-property",
    width: 627,
    height: 694,
  },
  {
    src: "/images/banner/banner-property-3.jpg",
    alt: "img-property",
    width: 627,
    height: 694,
  },
  {
    src: "/images/banner/banner-property-2.jpg",
    alt: "img-property",
    width: 628,
    height: 694,
  },
  {
    src: "/images/banner/banner-property-1.jpg",
    alt: "img-property",
    width: 627,
    height: 694,
  },
];

export default function Slider1({ propertyItem }) {
  const images = propertyItem?.images?.length
    ? propertyItem.images.map(img => ({
      src: img.url,
      alt: propertyItem.title || "property image",
      width: 627,
      height: 694,
    }))
    : propertyImages;

  return (
    <Gallery>
      <section className="flat-slider-detail-v1 px-10">
        <Swiper
          className="swiper tf-sw-location"
          slidesPerView={3}
          spaceBetween={10}
          breakpoints={{
            1200: {
              slidesPerView: 3, // for tablet
              spaceBetween: 10, // for space-lg
            },
            640: {
              slidesPerView: 2, // for mobile-sm
              spaceBetween: 10, // for space-md
            },
            0: {
              slidesPerView: 1, // for mobile
              spaceBetween: 10, // for space
            },
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb18" }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Item
                original={image.src}
                thumbnail={image.src}
                width={800}
                height={600}
              >
                {({ ref, open }) => (
                  <a
                    onClick={open}
                    data-fancybox="gallery"
                    className="box-img-detail d-block"
                  >
                    <Image
                      ref={ref}
                      alt={image.alt}
                      src={image.src}
                      width={image.width}
                      height={image.height}
                      style={{ objectFit: 'cover', width: '100%', height: '80vh' }}
                    />
                  </a>
                )}
              </Item>
            </SwiperSlide>
          ))}
          <div className="sw-pagination spb18 sw-pagination-location text-center" />
        </Swiper>
      </section>
    </Gallery>
  );
}
