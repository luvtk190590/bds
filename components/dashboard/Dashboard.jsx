import React from "react";
import LineChart from "./LineChart";
import DropdownSelect from "../common/DropdownSelect";
import Link from "next/link";
import Image from "next/image";
import Pagination from "../common/Pagination";
import { properties2, properties4 } from "@/data/properties";
import Pagination2 from "../common/Pagination2";
import UserPreferences from "./UserPreferences";
import RecommendedSection from "@/components/property/RecommendedSection";
export default function Dashboard() {
  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>
        <div className="flat-counter-v2 tf-counter">
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-listing" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Your listing</div>
              <div className="box-count d-flex align-items-end">
                {/* <h3 className="number fw-8" data-speed="2000" data-to="17" data-inviewport="yes">32</h3>       */}
                <h3 className="fw-8">32</h3>
                <span className="text">/50 remaining</span>
              </div>
            </div>
          </div>
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-pending" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Pending</div>
              <div className="box-count d-flex align-items-end">
                <h3 className="fw-8">02</h3>
              </div>
            </div>
          </div>
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-favorite" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Favorites</div>
              <div className="d-flex align-items-end">
                {/* <h6 className="number" data-speed="2000" data-to="1" data-inviewport="yes">1</h6>  */}
                <h3 className="fw-8">06</h3>
              </div>
            </div>
          </div>
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-review" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Reviews</div>
              <div className="d-flex align-items-end">
                <h3 className="fw-8">1.483</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="wrapper-content row">
          <div className="col-xl-9">
            <div className="widget-box-2 wd-listing">
              <h5 className="title">New Listing</h5>
              <div className="wd-filter">
                <div className="ip-group icon-left">
                  <input type="text" placeholder="Search" />
                  <span className="icon icon-search" />
                </div>
                <div className="ip-group icon">
                  <input
                    type="text"
                    id="datepicker1"
                    className="ip-datepicker icon"
                    placeholder="From Date"
                  />
                </div>
                <div className="ip-group icon">
                  <input
                    type="text"
                    id="datepicker2"
                    className="ip-datepicker icon"
                    placeholder="To Date"
                  />
                </div>
                <div className="ip-group">
                  <DropdownSelect
                    defaultOption="Select"
                    options={["Today", "Yesterday"]}
                  />
                </div>
              </div>
              <div className="d-flex gap-4">
                <span className="text-primary fw-7">26</span>
                <span className="fw-6">Results found</span>
              </div>
              <div className="wrap-table">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Listing</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties2.slice(1, 6).map((elm, i) => (
                        <tr key={i} className="file-delete">
                          <td>
                            <div className="listing-box">
                              <div className="images">
                                <Image
                                  alt="images"
                                  src={elm.imgSrc}
                                  width={615}
                                  height={405}
                                />
                              </div>
                              <div className="content">
                                <div className="title">
                                  <Link
                                    href={`/property-details-v1/${elm.id}`}
                                    className="link"
                                  >
                                    {elm.title}
                                  </Link>
                                </div>
                                <div className="text-date">
                                  Posting date: March 22, 2024
                                </div>
                                <div className="text-btn text-primary">
                                  ${elm.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="status-wrap">
                              <a
                                href="#"
                                className={`btn-status ${elm.status == "Pending" ? "pending" : ""
                                  }  ${elm.status == "Sold" ? "sold" : ""}`}
                              >
                                {" "}
                                {elm.status}
                              </a>
                            </div>
                          </td>
                          <td>
                            <ul className="list-action">
                              <li>
                                <a className="item">
                                  <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M11.2413 2.9915L12.366 1.86616C12.6005 1.63171 12.9184 1.5 13.25 1.5C13.5816 1.5 13.8995 1.63171 14.134 1.86616C14.3685 2.10062 14.5002 2.4186 14.5002 2.75016C14.5002 3.08173 14.3685 3.39971 14.134 3.63416L4.55467 13.2135C4.20222 13.5657 3.76758 13.8246 3.29 13.9668L1.5 14.5002L2.03333 12.7102C2.17552 12.2326 2.43442 11.7979 2.78667 11.4455L11.242 2.9915H11.2413ZM11.2413 2.9915L13 4.75016"
                                      stroke="#A3ABB0"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a className="item">
                                  <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.2427 12.2427C13.3679 11.1175 14.0001 9.59135 14.0001 8.00004C14.0001 6.40873 13.3679 4.8826 12.2427 3.75737C11.1175 2.63214 9.59135 2 8.00004 2C6.40873 2 4.8826 2.63214 3.75737 3.75737M12.2427 12.2427C11.1175 13.3679 9.59135 14.0001 8.00004 14.0001C6.40873 14.0001 4.8826 13.3679 3.75737 12.2427C2.63214 11.1175 2 9.59135 2 8.00004C2 6.40873 2.63214 4.8826 3.75737 3.75737M12.2427 12.2427L3.75737 3.75737"
                                      stroke="#A3ABB0"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Sold
                                </a>
                              </li>
                              <li>
                                <a className="remove-file item">
                                  <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                                      stroke="#A3ABB0"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="wd-navigation">
                  <Pagination2 />
                </ul>
              </div>
            </div>
            <div className="widget-box-2 wd-chart">
              <h5 className="title">Page Inside</h5>
              <div className="wd-filter-date">
                <div className="left">
                  <div className="dates active">Day</div>
                  <div className="dates">Week</div>
                  <div className="dates">Month</div>
                  <div className="dates">Year</div>
                </div>
                <div className="right">
                  <div className="ip-group icon">
                    <input
                      type="text"
                      id="datepicker3"
                      className="ip-datepicker icon"
                      placeholder="From Date"
                    />
                  </div>
                  <div className="ip-group icon">
                    <input
                      type="text"
                      id="datepicker4"
                      className="ip-datepicker icon"
                      placeholder="To Date"
                    />
                  </div>
                </div>
              </div>
              <div className="chart-box">
                <LineChart />
              </div>
            </div>
          </div>
          <div className="col-xl-3">
            <UserPreferences />
            <div className="widget-box-2 mess-box">
              <h5 className="title">Recent Reviews</h5>
              <ul className="list-mess">
                <li className="mess-item">
                  <div className="user-box">
                    <div className="avatar">
                      <Image
                        alt="avt"
                        src="/images/avatar/avt-png13.png"
                        width={51}
                        height={51}
                      />
                    </div>
                    <div className="content">
                      <div className="name fw-6">Bessie Cooper</div>
                      <span className="caption-2 text-variant-3">
                        3 day ago
                      </span>
                    </div>
                  </div>
                  <p>
                    Maecenas eu lorem et urna accumsan vestibulum vel vitae
                    magna.
                  </p>
                  <ul className="list-star">
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                  </ul>
                </li>
                <li className="mess-item">
                  <div className="user-box">
                    <div className="avatar">
                      <Image
                        alt="avt"
                        src="/images/avatar/avt-png14.png"
                        width={68}
                        height={68}
                      />
                    </div>
                    <div className="content">
                      <div className="name fw-6">Annette Black</div>
                      <span className="caption-2 text-variant-3">
                        3 day ago
                      </span>
                    </div>
                  </div>
                  <p>
                    Nullam rhoncus dolor arcu, et commodo tellus semper vitae.
                    Aenean finibus tristique lectus, ac lobortis mauris
                    venenatis ac.
                  </p>
                  <ul className="list-star">
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                  </ul>
                </li>
                <li className="mess-item">
                  <div className="user-box">
                    <div className="avatar">
                      <Image
                        alt="avt"
                        src="/images/avatar/avt-png15.png"
                        width={51}
                        height={51}
                      />
                    </div>
                    <div className="content">
                      <div className="name fw-6">Ralph Edwards</div>
                      <span className="caption-2 text-variant-3">
                        3 day ago
                      </span>
                    </div>
                  </div>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vivamus viverra semper convallis. Integer vestibulum tempus
                    tincidunt.
                  </p>
                  <ul className="list-star">
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                  </ul>
                </li>
                <li className="mess-item">
                  <div className="user-box">
                    <div className="avatar">
                      <Image
                        alt="avt"
                        src="/images/avatar/avt-png16.png"
                        width={51}
                        height={51}
                      />
                    </div>
                    <div className="content">
                      <div className="name fw-6">Jerome Bell</div>
                      <span className="caption-2 text-variant-3">
                        3 day ago
                      </span>
                    </div>
                  </div>
                  <p>
                    Fusce sit amet purus eget quam eleifend hendrerit nec a
                    erat. Sed turpis neque, iaculis blandit viverra ut, dapibus
                    eget nisi.
                  </p>
                  <ul className="list-star">
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                  </ul>
                </li>
                <li className="mess-item">
                  <div className="user-box">
                    <div className="avatar">
                      <Image
                        alt="avt"
                        src="/images/avatar/avt-png17.png"
                        width={51}
                        height={51}
                      />
                    </div>
                    <div className="content">
                      <div className="name fw-6">Albert Flores</div>
                      <span className="caption-2 text-variant-3">
                        3 day ago
                      </span>
                    </div>
                  </div>
                  <p>
                    Donec bibendum nibh quis nisl luctus, at aliquet ipsum
                    bibendum. Fusce at dui tincidunt nulla semper venenatis at
                    et magna. Mauris turpis lorem, ultricies vel justo sed.
                  </p>
                  <ul className="list-star">
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                    <li className="icon icon-star" />
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-dashboard">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
