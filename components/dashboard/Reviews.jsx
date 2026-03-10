import React from "react";
import Image from "next/image";
import { reviews } from "@/data/dashboard";
export default function Reviews() {
  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>
        <div className="widget-box-2 mess-box">
          <h5 className="title">Recent Reviews</h5>
          <ul className="list-mess">
            {reviews.map((msg, index) => (
              <li className="mess-item" key={index}>
                <div className="user-box">
                  <div className="avatar">
                    <Image
                      alt="avt"
                      src={msg.avatarSrc}
                      width={51}
                      height={51}
                    />
                  </div>
                  <div className="content justify-content-start">
                    <div className="name fw-6">{msg.name}</div>
                    <span className="caption-2 text-variant-3">
                      {msg.timeAgo}
                    </span>
                  </div>
                </div>
                <p>{msg.message}</p>
                <ul className="list-star">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <li className="icon icon-star" key={starIndex} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-dashboard footer-dashboard-2">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
