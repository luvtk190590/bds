"use client";
import { blogPosts3 } from "@/data/blogs";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Pagination } from "swiper/modules";
export default function Blogs() {
  return (
    <section className="flat-section pt-0">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Latest New</div>
          <h3 className="title mt-4">The Most Recent Estate</h3>
        </div>
        <Swiper
          className="swiper tf-sw-location wow fadeInUp"
          slidesPerView={4} // data-preview="{4}"
          spaceBetween={30} // data-space-lg="{30}"
          breakpoints={{
            0: {
              slidesPerView: 1, // data-mobile="{1}"
              spaceBetween: 15, // data-space="{15}"
              pagination: { clickable: true }, // data-pagination-sm="{2}"
            },
            480: {
              slidesPerView: 2, // data-mobile-sm="{2}"
              spaceBetween: 15, // data-space-md="{15}"
              pagination: { clickable: true }, // data-pagination-md="{3}"
            },
            768: {
              slidesPerView: 3, // data-tablet="{3}"
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4, // data-preview="{4}"
              spaceBetween: 30, // data-space-lg="{30}"
              pagination: { clickable: true }, // data-pagination-lg="{4}"
            },
          }}
          data-wow-delay=".2s"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb10" }}
        >
          {blogPosts3.map((post, index) => (
            <SwiperSlide key={index}>
              <Link
                href={`/blog-detail/${post.id}`}
                className="flat-blog-item hover-img style-1"
              >
                <div className="img-style">
                  <Image
                    className="lazyload"
                    data-src={post.imgSrc}
                    alt={post.alt}
                    src={post.imgSrc}
                    width="450"
                    height="800"
                  />
                </div>
                <span className="date-post">{post.date}</span>
                <div className="content-box">
                  <h6 className="title">{post.title}</h6>
                  <div className="post-author">
                    <span className="fw-6">{post.author}</span>
                    <span>{post.category}</span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
          <div className="sw-pagination spb10 sw-pagination-location text-center"></div>
        </Swiper>
      </div>
    </section>
  );
}
