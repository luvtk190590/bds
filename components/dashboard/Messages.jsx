import React from "react";
import Image from "next/image";
import { messages } from "@/data/dashboard";
export default function Messages() {
  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>
        <div className="widget-box-2 mess-box">
          <h5 className="title">Message</h5>
          <ul className="list-mess">
            {messages.map((msg, index) => (
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
                  <div className="content">
                    <div className="name fw-6">{msg.name}</div>
                    <span className="caption-2 text-variant-3">
                      {msg.timeAgo}
                    </span>
                  </div>
                </div>
                <p>{msg.message}</p>
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
