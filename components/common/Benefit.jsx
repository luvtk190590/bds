import React from "react";
import Image from "next/image";
import { benefits } from "@/data/benefits";
export default function Benefit() {
  return (
    <section className="mx-5 bg-primary-new radius-30">
      <div className="flat-img-with-text">
        <div className="content-left img-animation wow">
          <Image
            className="lazyload"
            data-src="/images/banner/img-w-text1.jpg"
            alt=""
            src="/images/banner/img-w-text1.jpg"
            width={950}
            height={908}
          />
        </div>
        <div className="content-right">
          <div className="box-title wow fadeInUp">
            <div className="text-subtitle text-primary">Lợi Ích Của Chúng Tôi</div>
            <h3 className="title mt-4">Tại Sao Nên Chọn HomeLengo</h3>
            <p className="desc text-variant-1">
              Đội ngũ giàu kinh nghiệm của chúng tôi xuất sắc trong lĩnh vực bất động sản với nhiều năm điều hướng <br />
              thị trường thành công, đưa ra các quyết định sáng suốt và kết quả tối ưu.
            </p>
          </div>
          <div className="flat-service wow fadeInUp" data-wow-delay=".2s">
            {benefits.map((benefit, index) => (
              <a href="#" key={index} className="box-benefit hover-btn-view">
                <div className="icon-box">
                  <span className={`icon ${benefit.iconClass}`} />
                </div>
                <div className="content">
                  <h5 className="title">{benefit.title}</h5>
                  <p className="description">{benefit.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
