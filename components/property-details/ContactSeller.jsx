"use client";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ContactSeller({ propertyItem }) {
  const owner = propertyItem?.owner || {};
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Đã gửi yêu cầu liên hệ thành công!");
      setLoading(false);
      e.target.reset();
    }, 1000);
  };

  return (
    <>
      {" "}
      <h5 className="title fw-6">Liên hệ người bán</h5>
      <div className="box-avatar">
        <div className="avatar avt-100 round">
          <Image
            alt="avatar"
            src={owner.avatar_url || "/images/avatar/avt-1.jpg"}
            width={100}
            height={100}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="info">
          <h6 className="name">{owner.full_name || owner.company_name || "Chủ nhà"}</h6>
          <ul className="list">
            <li className="d-flex align-items-center gap-4 text-variant-1">
              <i className="icon icon-phone" />
              {owner.phone || "Đang cập nhật"}
            </li>
            <li className="d-flex align-items-center gap-4 text-variant-1">
              <i className="icon icon-mail" />
              {owner.email || "Đang cập nhật"}
            </li>
          </ul>
        </div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="ip-group">
          <input type="text" placeholder="Họ và tên" className="form-control" required />
        </div>
        <div className="ip-group">
          <input
            type="text"
            placeholder="Số điện thoại"
            className="form-control"
            required
          />
        </div>
        <div className="ip-group">
          <input
            type="email"
            placeholder="Email"
            className="form-control"
          />
        </div>
        <div className="ip-group">
          <textarea
            id="comment-message"
            name="message"
            rows={4}
            tabIndex={4}
            placeholder="Nội dung tin nhắn..."
            aria-required="true"
            required
            defaultValue={`Tôi quan tâm đến bất động sản: ${propertyItem?.title}`}
          />
        </div>
        <button
          type="submit"
          className="tf-btn btn-view primary hover-btn-view w-100"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi liên hệ"}
          <span className="icon icon-arrow-right2" />
        </button>
      </form>
    </>
  );
}
