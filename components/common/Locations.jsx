"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const defaultImages = [
  "/images/location/location-1.jpg",
  "/images/location/location-2.jpg",
  "/images/location/location-3.jpg",
  "/images/location/location-4.jpg",
  "/images/location/location-5.jpg",
  "/images/location/location-6.jpg",
];

export default function Locations({ parentClass = "flat-location px-10" }) {
  const { data: locations = [], isLoading } = useSWR('top-provinces', async () => {
    const { data, error } = await supabase.rpc('get_top_provinces', { p_limit: 10 });
    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  });

  if (isLoading || locations.length === 0) return null;

  return (
    <section className={parentClass}>
      <div className="box-title text-center wow fadeInUp">
        <div className="text-subtitle text-primary">Địa điểm nổi bật</div>
        <h3 className="mt-4 title">Bất động sản theo địa điểm</h3>
      </div>
      <div className="wow fadeInUp" data-wow-delay=".2s">
        <Swiper
          className="swiper tf-sw-location"
          spaceBetween={8}
          slidesPerView={6}
          breakpoints={{
            1600: { slidesPerView: 6, spaceBetween: 8 },
            1224: { slidesPerView: 4, spaceBetween: 8 },
            1100: { slidesPerView: 3, spaceBetween: 8 },
            768: { slidesPerView: 3, spaceBetween: 8 },
            500: { slidesPerView: 2, spaceBetween: 8 },
            320: { slidesPerView: 1, spaceBetween: 8 },
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spd4" }}
        >
          {locations.map((location, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <Link href={`/properties-map?province=${location.code}`} className="box-location">
                <div className="image img-style">
                  <Image
                    className="lazyload"
                    data-src={location.thumbnail_url || defaultImages[index % defaultImages.length]}
                    alt={location.name}
                    src={location.thumbnail_url || defaultImages[index % defaultImages.length]}
                    width={465}
                    height={578}
                    style={{ aspectRatio: '465/578', objectFit: 'cover' }}
                  />
                </div>
                <div className="content">
                  <div className="inner-left">
                    <span className="sub-title fw-6">{location.property_count} Bất động sản</span>
                    <h6 className="title text-line-clamp-1 link">
                      {location.name}
                    </h6>
                  </div>
                  <button className="box-icon line w-44 round">
                    <i className="icon icon-arrow-right2" />
                  </button>
                </div>
              </Link>
            </SwiperSlide>
          ))}
          <div className="sw-pagination spd4 spd1 sw-pagination-location text-center" />
        </Swiper>
      </div>
    </section>
  );
}
