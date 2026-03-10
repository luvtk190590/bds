"use client";

import { blogPosts7 } from "@/data/blogs";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "swiper/modules";
export default function Blogs2() {
  return (
    <section className="flat-section bg-primary-new">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Latest New</div>
          <h3 className="title mt-4">From Our Blog</h3>
        </div>
        <Swiper
          className="swiper tf-sw-latest"
          slidesPerView={3} // equivalent to data-preview={3}
          spaceBetween={30} // equivalent to data-space-lg={30}
          breakpoints={{
            1024: { slidesPerView: 3, spaceBetween: 30 }, // large screens
            768: { slidesPerView: 2, spaceBetween: 15 }, // tablets (data-tablet)
            540: { slidesPerView: 2, spaceBetween: 15 }, // mobile-small (data-mobile-sm)
            0: { slidesPerView: 1, spaceBetween: 15 }, // mobile (data-mobile)
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb17" }}
        >
          {blogPosts7.map((post, index) => (
            <SwiperSlide key={index}>
              <Link
                href={`/blog-detail/${post.id}`}
                className="flat-blog-item hover-img"
              >
                <div className="img-style">
                  <Image
                    className="lazyload"
                    data-src={post.imgSrc}
                    alt="img-blog"
                    width={615}
                    height={405}
                    src={post.imgSrc}
                  />
                  <span className="date-post">{post.date}</span>
                </div>
                <div className="content-box">
                  <div className="post-author">
                    <span className="fw-6">{post.author}</span>
                    <span>{post.category}</span>
                  </div>
                  <h5 className="title link">{post.title}</h5>
                  <p className="description">{post.description}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
          <div className="sw-pagination spb17 sw-pagination-latest text-center" />
        </Swiper>
      </div>
    </section>
  );
}
