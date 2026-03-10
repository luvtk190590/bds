import React from "react";
import Link from "next/link";
import Image from "next/image";
import { blogPosts8 } from "@/data/blogs";
import Pagination from "../common/Pagination";
import Pagination2 from "../common/Pagination2";
export default function Blogs2() {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="row">
          {blogPosts8.map((post, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <Link
                href={`/blog-detail/${post.id}`}
                className="flat-blog-item hover-img"
              >
                <div className="img-style">
                  <Image
                    className="lazyload"
                    data-src={post.imgSrc}
                    alt="img-blog"
                    src={post.imgSrc}
                    width={615}
                    height={405}
                  />
                  <span className="date-post">{post.date}</span>
                </div>
                <div className="content-box">
                  <div className="post-author">
                    <span className="fw-7">{post.author.name}</span>
                    <span>{post.author.category}</span>
                  </div>
                  <h5 className="title link">{post.title}</h5>
                  <p className="description">{post.description}</p>
                </div>
              </Link>
            </div>
          ))}
          <div className="col-12 text-center pt-26 line-t">
            <ul className="justify-content-center wd-navigation">
              <Pagination2 />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
