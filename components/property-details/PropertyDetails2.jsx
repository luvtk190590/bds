import Description from "./Description";
import Overview from "./Overview";
import Video from "./Video";
import Details from "./Details";
import Features from "./Features";
import MapLocation from "./MapLocation";
import FloorPlan from "./FloorPlan";
import AttachMents from "./AttachMents";
import Explore from "./Explore";
import LoanCalculator from "./LoanCalculator";
import Nearby from "./Nearby";
import GuestReview from "./GuestReview";
import ContactSeller from "./ContactSeller";
import WidgetBox from "./WidgetBox";
import WhyChoose from "./WhyChoose";
import LeatestProperties from "./LeatestProperties";
export default function PropertyDetails2() {
  return (
    <>
      <section className="flat-section-v3 flat-property-detail-v2">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-7">
              <div className="single-property-element">
                <div className="header-property-detail">
                  <div className="content-top d-flex justify-content-between align-items-center">
                    <h3 className="title link fw-8">
                      Lakeview Haven, Lake Tahoe
                    </h3>
                    <div className="box-price d-flex align-items-end">
                      <h3 className="fw-8">$250,00</h3>
                      <span className="body-1 text-variant-1">/month</span>
                    </div>
                  </div>
                  <div className="content-bottom">
                    <div className="box-left">
                      <div className="info-box">
                        <p className="meta-item mb-8">
                          <span className="icon icon-mapPin" />
                          <span className="text-variant-1">
                            145 Brooklyn Ave, Califonia, New York
                          </span>
                        </p>
                        <ul className="meta">
                          <li className="meta-item">
                            <i className="icon icon-bed" />
                            <span className="text-variant-1">Beds:</span>
                            <span className="fw-6">3</span>
                          </li>
                          <li className="meta-item">
                            <i className="icon icon-bath" />
                            <span className="text-variant-1">Baths:</span>
                            <span className="fw-6">2</span>
                          </li>
                          <li className="meta-item">
                            <i className="icon icon-sqft" />
                            <span className="text-variant-1">Sqft:</span>
                            <span className="fw-6">1150</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <ul className="icon-box">
                      <li>
                        <a href="#" className="item">
                          <svg
                            className="icon"
                            width={18}
                            height={18}
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15.75 6.1875C15.75 4.32375 14.1758 2.8125 12.234 2.8125C10.7828 2.8125 9.53625 3.657 9 4.86225C8.46375 3.657 7.21725 2.8125 5.76525 2.8125C3.825 2.8125 2.25 4.32375 2.25 6.1875C2.25 11.6025 9 15.1875 9 15.1875C9 15.1875 15.75 11.6025 15.75 6.1875Z"
                              stroke="#A3ABB0"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="item">
                          <svg
                            className="icon"
                            width={18}
                            height={18}
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.625 15.75L2.25 12.375M2.25 12.375L5.625 9M2.25 12.375H12.375M12.375 2.25L15.75 5.625M15.75 5.625L12.375 9M15.75 5.625H5.625"
                              stroke="#A3ABB0"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="item">
                          <svg
                            className="icon"
                            width={18}
                            height={18}
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.41251 8.18022C5.23091 7.85345 4.94594 7.59624 4.60234 7.44895C4.25874 7.30167 3.87596 7.27265 3.51408 7.36645C3.1522 7.46025 2.83171 7.67157 2.60293 7.96722C2.37414 8.26287 2.25 8.62613 2.25 8.99997C2.25 9.37381 2.37414 9.73706 2.60293 10.0327C2.83171 10.3284 3.1522 10.5397 3.51408 10.6335C3.87596 10.7273 4.25874 10.6983 4.60234 10.551C4.94594 10.4037 5.23091 10.1465 5.41251 9.81972M5.41251 8.18022C5.54751 8.42322 5.62476 8.70222 5.62476 8.99997C5.62476 9.29772 5.54751 9.57747 5.41251 9.81972M5.41251 8.18022L12.587 4.19472M5.41251 9.81972L12.587 13.8052M12.587 4.19472C12.6922 4.39282 12.8358 4.56797 13.0095 4.70991C13.1832 4.85186 13.3834 4.95776 13.5985 5.02143C13.8135 5.08509 14.0392 5.10523 14.2621 5.08069C14.4851 5.05614 14.7009 4.98739 14.897 4.87846C15.093 4.76953 15.2654 4.62261 15.404 4.44628C15.5427 4.26995 15.6448 4.06775 15.7043 3.85151C15.7639 3.63526 15.7798 3.40931 15.751 3.18686C15.7222 2.96442 15.6494 2.74994 15.5368 2.55597C15.3148 2.17372 14.9518 1.89382 14.5256 1.77643C14.0995 1.65904 13.6443 1.71352 13.2579 1.92818C12.8715 2.14284 12.5848 2.50053 12.4593 2.92436C12.3339 3.34819 12.3797 3.80433 12.587 4.19472ZM12.587 13.8052C12.4794 13.999 12.4109 14.2121 12.3856 14.4323C12.3603 14.6525 12.3787 14.8756 12.4396 15.0887C12.5005 15.3019 12.6028 15.5009 12.7406 15.6746C12.8784 15.8482 13.0491 15.9929 13.2429 16.1006C13.4367 16.2082 13.6498 16.2767 13.87 16.302C14.0902 16.3273 14.3133 16.3089 14.5264 16.248C14.7396 16.1871 14.9386 16.0848 15.1122 15.947C15.2858 15.8092 15.4306 15.6385 15.5383 15.4447C15.7557 15.0534 15.8087 14.5917 15.6857 14.1612C15.5627 13.7307 15.2737 13.3668 14.8824 13.1493C14.491 12.9319 14.0293 12.8789 13.5989 13.0019C13.1684 13.1249 12.8044 13.4139 12.587 13.8052Z"
                              stroke="#A3ABB0"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="item">
                          <svg
                            className="icon"
                            width={18}
                            height={18}
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.04 10.3718C4.86 10.3943 4.68 10.4183 4.5 10.4438M5.04 10.3718C7.66969 10.0418 10.3303 10.0418 12.96 10.3718M5.04 10.3718L4.755 13.5M12.96 10.3718C13.14 10.3943 13.32 10.4183 13.5 10.4438M12.96 10.3718L13.245 13.5L13.4167 15.3923C13.4274 15.509 13.4136 15.6267 13.3762 15.7378C13.3388 15.8489 13.2787 15.951 13.1996 16.0376C13.1206 16.1242 13.0244 16.1933 12.9172 16.2407C12.8099 16.288 12.694 16.3125 12.5767 16.3125H5.42325C4.92675 16.3125 4.53825 15.8865 4.58325 15.3923L4.755 13.5M4.755 13.5H3.9375C3.48995 13.5 3.06072 13.3222 2.74426 13.0057C2.42779 12.6893 2.25 12.2601 2.25 11.8125V7.092C2.25 6.28125 2.826 5.58075 3.62775 5.46075C4.10471 5.3894 4.58306 5.32764 5.0625 5.2755M13.2435 13.5H14.0618C14.2834 13.5001 14.5029 13.4565 14.7078 13.3718C14.9126 13.287 15.0987 13.1627 15.2555 13.006C15.4123 12.8493 15.5366 12.6632 15.6215 12.4585C15.7063 12.2537 15.75 12.0342 15.75 11.8125V7.092C15.75 6.28125 15.174 5.58075 14.3723 5.46075C13.8953 5.38941 13.4169 5.32764 12.9375 5.2755M12.9375 5.2755C10.3202 4.99073 7.67978 4.99073 5.0625 5.2755M12.9375 5.2755V2.53125C12.9375 2.0655 12.5595 1.6875 12.0938 1.6875H5.90625C5.4405 1.6875 5.0625 2.0655 5.0625 2.53125V5.2755M13.5 7.875H13.506V7.881H13.5V7.875ZM11.25 7.875H11.256V7.881H11.25V7.875Z"
                              stroke="#A3ABB0"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="single-property-desc">
                  <Description />
                </div>
                <div className="single-property-overview">
                  <Overview />
                </div>
              </div>
              <div className="single-property-element single-property-video">
                <Video />
              </div>
              <div className="single-property-element single-property-info">
                <Details />
              </div>
              <div className="single-property-element single-property-feature">
                <Features />
              </div>
              <div className="single-property-element single-property-map">
                <MapLocation />
              </div>
              <div className="single-property-element single-property-floor">
                <FloorPlan />
              </div>
              <div className="single-property-element single-property-attachments">
                <AttachMents />
              </div>
              <div className="single-property-element single-property-explore">
                <Explore />
              </div>
              <div className="single-property-element single-property-loan">
                <LoanCalculator />
              </div>
              <div className="single-property-element single-property-nearby">
                <Nearby />
              </div>
              <div className="single-property-element single-wrapper-review">
                <GuestReview />
              </div>
            </div>
            <div className="col-xl-4 col-lg-5">
              <div className="single-sidebar fixed-sidebar">
                <div className="widget-box single-property-contact">
                  <ContactSeller />
                </div>
                <div className="flat-tab flat-tab-form widget-filter-search widget-box">
                  <WidgetBox />
                </div>
                <div className="widget-box single-property-whychoose">
                  <WhyChoose />
                </div>
                <div className="box-latest-property bg-white">
                  <LeatestProperties />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
