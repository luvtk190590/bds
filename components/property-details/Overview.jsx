import React from "react";
import { formatArea } from "@/lib/utils/formatters";

const directionMap = {
  north: "Bắc",
  south: "Nam",
  east: "Đông",
  west: "Tây",
  northeast: "Đông Bắc",
  northwest: "Tây Bắc",
  southeast: "Đông Nam",
  southwest: "Tây Nam",
};

export default function Overview({ propertyItem }) {
  return (
    <>
      <h6 className="title fw-6">Tổng quan</h6>
      <ul className="info-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px 10px' }}>
        {/* Hướng nhà instead of Loại hình */}
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-house-line" />
          </a>
          <div className="content">
            <span className="label">Hướng nhà:</span>
            <span>{directionMap[propertyItem?.direction] || propertyItem?.direction || "Đang cập nhật"}</span>
          </div>
        </li>
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-home-location" />
          </a>
          <div className="content">
            <span className="label">Số tầng:</span>
            <span>{propertyItem?.floors || "--"} tầng</span>
          </div>
        </li>
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-bed1" />
          </a>
          <div className="content">
            <span className="label">Phòng ngủ:</span>
            <span>{propertyItem?.bedrooms || "--"}</span>
          </div>
        </li>
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-bathtub" />
          </a>
          <div className="content">
            <span className="label">Phòng tắm:</span>
            <span>{propertyItem?.bathrooms || "--"}</span>
          </div>
        </li>

        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-crop" />
          </a>
          <div className="content">
            <span className="label">Diện tích:</span>
            <span>{propertyItem?.area ? formatArea(propertyItem.area) : "--"}</span>
          </div>
        </li>
        {/* Hướng ban công instead of Năm xây dựng */}
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-map-trifold" />
          </a>
          <div className="content">
            <span className="label">Hướng ban công:</span>
            <span>{directionMap[propertyItem?.balcony_direction] || propertyItem?.balcony_direction || "--"}</span>
          </div>
        </li>
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-list-dashes" />
          </a>
          <div className="content">
            <span className="label">Pháp lý:</span>
            <span>{propertyItem?.legal_status || "--"}</span>
          </div>
        </li>
        {/* Added Nội thất */}
        <li className="item">
          <a href="#" className="box-icon w-52">
            <i className="icon icon-dishwasher" />
          </a>
          <div className="content">
            <span className="label">Nội thất:</span>
            <span>{propertyItem?.furniture_status || "--"}</span>
          </div>
        </li>
      </ul>
    </>
  );
}
