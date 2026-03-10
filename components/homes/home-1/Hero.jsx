import HeroFilter from "./HeroFilter";
import WordEffect1 from "@/components/common/WordEffect1";

export default function Hero() {
  return (
    <section className="flat-slider home-1">
      <div className="container relative">
        <div className="row">
          <div className="col-lg-12">
            <div className="slider-content">
              <div className="heading text-center">
                <div className="title-large text-white animationtext slide">
                  Tìm{" "}
                  <WordEffect1 string={["Ngôi Nhà Mơ Ước", "Bất Động Sản Lý Tưởng"]} />
                </div>
                <p
                  className="subtitle text-white body-2 wow fadeInUp"
                  data-wow-delay=".2s"
                >
                  Hàng nghìn bất động sản được cập nhật mỗi ngày — tìm kiếm theo khu vực, loại hình, mức giá phù hợp với bạn.
                </p>
              </div>
              <HeroFilter />
            </div>
          </div>
        </div>
      </div>
      <div className="overlay" />
    </section>
  );
}
