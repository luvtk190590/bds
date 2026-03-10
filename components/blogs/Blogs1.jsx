"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import Pagination2 from "../common/Pagination2";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Blogs1() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10);
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);
  return (
    <section className="flat-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="flat-blog-list">
              {loading ? (
                <div className="text-center w-100 py-5">
                  <p>Đang tải tin tức...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center w-100 py-5">
                  <p>Chưa có bài viết nào.</p>
                </div>
              ) : (
                posts.map((item) => (
                  <div className="flat-blog-item" key={item.id}>
                    <Link href={`/blog-detail/${item.id}`} className="img-style">
                      <Image
                        className="lazyload"
                        data-src={item.image_url || "/images/blog/blog-lg-1.jpg"}
                        alt={item.title}
                        src={item.image_url || "/images/blog/blog-lg-1.jpg"}
                        width={840}
                        height={473}
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="content-box">
                      <h5 className="title text-black-2">
                        <Link href={`/blog-detail/${item.id}`} className="link">
                          {item.title}
                        </Link>
                      </h5>
                      <div className="post-author d-flex align-items-center">
                        <span className="text-primary fw-6 d-inline-flex align-items-center">
                          <svg
                            className="icon"
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 8.5V8C1.5 7.60218 1.65804 7.22064 1.93934 6.93934C2.22064 6.65804 2.60218 6.5 3 6.5H13C13.3978 6.5 13.7794 6.65804 14.0607 6.93934C14.342 7.22064 14.5 7.60218 14.5 8V8.5M8.70667 4.20667L7.29333 2.79333C7.20048 2.70037 7.09022 2.62661 6.96886 2.57628C6.84749 2.52595 6.71739 2.50003 6.586 2.5H3C2.60218 2.5 2.22064 2.65804 1.93934 2.93934C1.65804 3.22064 1.5 3.60218 1.5 4V12C1.5 12.3978 1.65804 12.7794 1.93934 13.0607C2.22064 13.342 2.60218 13.5 3 13.5H13C13.3978 13.5 13.7794 13.342 14.0607 13.0607C14.342 12.7794 14.5 12.3978 14.5 12V6C14.5 5.60218 14.342 5.22064 14.0607 4.93934C13.7794 4.65804 13.3978 4.5 13 4.5H9.414C9.14887 4.49977 8.89402 4.39426 8.70667 4.20667Z"
                              stroke="#A3ABB0"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {item.category || "Tin tức"}
                        </span>
                        <span className="fw-6 text-variant-1">
                          {new Date(item.published_at || item.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="description">{item.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <ul className="justify-content-center wd-navigation">
              <Pagination2 />
            </ul>
          </div>
          <div className="col-lg-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
