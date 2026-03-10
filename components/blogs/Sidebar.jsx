import { recentPosts } from "@/data/blogs";
import Image from "next/image";

const categories = [
  { name: "Market Updates", count: 50 },
  { name: "Buying Tips", count: 34 },
  { name: "Interior Inspiration", count: 69 },
  { name: "Investment Insights", count: 25 },
  { name: "Home Construction", count: 12 },
  { name: "Legal Guidance", count: 12 },
  { name: "Community Spotlight", count: 69 },
];

const tags = [
  "Property",
  "Office",
  "Finance",
  "Legal",
  "Market",
  "Invest",
  "Renovate",
];

export default function Sidebar() {
  return (
    <aside className="sidebar-blog fixed-sidebar">
      <div className="widget-search">
        <h5 className="text-black-2 text-capitalize">Search Blog</h5>
        <div className="search-box">
          <input className="search-field" type="text" placeholder="Search..." />
          <a href="#" className="icon icon-search" />
        </div>
      </div>
      <div className="widget-box categories">
        <h5 className="text-black-2 text-capitalize">Categories</h5>
        <ul className="mt-20">
          {categories.map((category, index) => (
            <li key={index}>
              <a href="#" className="categories-item link">
                <span>{category.name}</span>
                <span>({category.count})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="widget-box recent">
        <h5 className="text-black-2 text-capitalize">Featured listings</h5>
        <ul>
          {recentPosts.map((post, index) => (
            <li key={index}>
              <div className="recent-post-item not-overlay hover-img">
                <a href="blog-detail" className="img-style">
                  <Image
                    alt="post-recent"
                    src={post.imgSrc}
                    width={112}
                    height={74}
                  />
                </a>
                <div className="content">
                  <a href="blog-detail" className="title link">
                    {post.title}
                  </a>
                  <div className="subtitle">
                    <svg
                      width={16}
                      height={17}
                      viewBox="0 0 16 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.5 2.5V4M11.5 2.5V4M2 13V5.5C2 5.10218 2.15804 4.72064 2.43934 4.43934C2.72064 4.15804 3.10218 4 3.5 4H12.5C12.8978 4 13.2794 4.15804 13.5607 4.43934C13.842 4.72064 14 5.10218 14 5.5V13M2 13C2 13.3978 2.15804 13.7794 2.43934 14.0607C2.72064 14.342 3.10218 14.5 3.5 14.5H12.5C12.8978 14.5 13.2794 14.342 13.5607 14.0607C13.842 13.7794 14 13.3978 14 13M2 13V8C2 7.60218 2.15804 7.22064 2.43934 6.93934C2.72064 6.65804 3.10218 6.5 3.5 6.5H12.5C12.8978 6.5 13.2794 6.65804 13.5607 6.93934C13.842 7.22064 14 7.60218 14 8V13"
                        stroke="#7C818B"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="widget-box newsletter">
        <h5 className="text-black-2 text-capitalize">Join our newsletter</h5>
        <p className="caption-2 text-variant-1 mt-20">
          Signup to be the first to hear about exclusive deals, special offers
          and upcoming collections
        </p>
        <div className="search-box mt-20">
          <input
            className="search-field"
            type="text"
            placeholder="Enter your email"
          />
          <a href="#" className="icon">
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.00035 7.99998L2.17969 2.08398C6.53489 3.35043 10.6419 5.35118 14.3237 7.99998C10.6422 10.6492 6.53541 12.6504 2.18035 13.9173L4.00035 7.99998ZM4.00035 7.99998H9.00035"
                stroke="#1563DF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
      <div className="widget-box tag">
        <h5 className="text-black-2 text-capitalize">Popular Tag</h5>
        <ul className="mt-20">
          {tags.map((tag, index) => (
            <li key={index}>
              <a href="#" className="tag-item">
                {tag}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
