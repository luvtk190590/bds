"use client";
import Image from "next/image";
import { blogPosts2 } from "@/data/blogs";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Pagination } from "swiper/modules";
export default function Blogs() {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Latest New</div>
          <h3 className="title mt-4">From Our Blog</h3>
        </div>

        <Swiper
          spaceBetween={30} // data-space-lg
          slidesPerView={3} // data-preview
          breakpoints={{
            1000: {
              slidesPerView: 3, // data-tablet
            },
            768: {
              slidesPerView: 2, // data-tablet
            },
            576: {
              slidesPerView: 2, // data-mobile-sm
            },
            0: {
              slidesPerView: 1, // data-mobile
            },
          }}
          className="swiper tf-sw-latest"
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb8" }}
        >
          {blogPosts2.map((post, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <Link
                href={`/blog-detail/${post.id}`}
                className="flat-blog-item hover-img"
              >
                <div className="img-style">
                  <Image
                    className="lazyload"
                    data-src={post.imgSrc}
                    alt={post.alt}
                    src={post.imgSrc}
                    width={615}
                    height={405}
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
          <div className="sw-pagination spb8 sw-pagination-latest text-center" />
        </Swiper>
      </div>
    </section>
  );
}
