"use client";
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Pagination } from "swiper/modules";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(6);
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);
  return (
    <section className="flat-section bg-primary-new">
      <div className="container">
        <div className="box-title text-center wow fadeInUp">
          <div className="text-subtitle text-primary">Tin tức mới nhất</div>
          <h3 className="title mt-4">Tin bất động sản</h3>
        </div>
        <Swiper
          className="swiper tf-sw-latest wow fadeInUp"
          data-wow-delay=".2s"
          spaceBetween={15} // equivalent to data-space
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 15, // equivalent to data-space-md and data-space-mobile
            },
            576: {
              slidesPerView: 2,
              spaceBetween: 15, // equivalent to data-space-mobile-sm
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 15, // tablet setting
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30, // desktop (equivalent to data-space-lg)
            },
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb7" }}
        >
          {loading ? (
            <div className="text-center w-100 py-5">Đang tải...</div>
          ) : posts.map((post, index) => (
            <SwiperSlide className="swiper-slide" key={post.id || index}>
              <Link
                href={`/blog-detail/${post.id}`}
                className="flat-blog-item hover-img"
              >
                <div className="img-style">
                  <Image
                    className="lazyload"
                    data-src={post.image_url || "/images/blog/blog-lg-1.jpg"}
                    alt={post.title}
                    src={post.image_url || "/images/blog/blog-lg-1.jpg"}
                    width={615}
                    height={405}
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="date-post">
                    {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="content-box">
                  <div className="post-author d-flex gap-2">
                    <span className="fw-6">{post.author_name || "Admin"}</span>
                    <span>{post.category || "Tin tức"}</span>
                  </div>
                  <h5 className="title link text-line-clamp-2">{post.title}</h5>
                  <p className="description text-line-clamp-2">{post.description}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}

          <div className="sw-pagination spb7 sw-pagination-latest text-center" />
        </Swiper>
      </div>
    </section>
  );
}
