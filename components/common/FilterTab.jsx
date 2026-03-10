"use client";
import React, { useEffect, useRef } from "react";
import DropdownSelect from "./DropdownSelect";
import AdvanceSearch from "./AdvanceSearch";

export default function FilterTab({
  tabClass = "nav-tab-form style-1 justify-content-center",
  styleClass = "",
}) {
  const ddContainer = useRef();
  const advanceBtnRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown and the button
      if (
        ddContainer.current &&
        !ddContainer.current.contains(event.target) &&
        advanceBtnRef.current &&
        !advanceBtnRef.current.contains(event.target)
      ) {
        ddContainer.current?.classList.remove("show");
      }
    };
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="flat-tab flat-tab-form">
      <ul className={tabClass} role="tablist">
        <li className="nav-tab-item" role="presentation">
          <a
            href="#forRent"
            className="nav-link-item active"
            data-bs-toggle="tab"
          >
            For Rent
          </a>
        </li>
        <li className="nav-tab-item" role="presentation">
          <a href="#forSale" className="nav-link-item" data-bs-toggle="tab">
            For Sale
          </a>
        </li>
      </ul>
      <div className="tab-content">
        <div className="tab-pane fade active show" role="tabpanel">
          <div className="form-sl">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={`wd-find-select ${styleClass}`}>
                <div className="inner-group">
                  <div className="form-group-1 search-form form-style">
                    <label>Type</label>
                    <div className="group-select">
                      <DropdownSelect
                        options={["All", "Villa", "Studio", "Office", "House"]}
                      />
                    </div>
                  </div>
                  <div className="form-group-2 form-style">
                    <label>Location</label>
                    <div className="group-ip">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Location"
                        defaultValue=""
                        name="s"
                        title="Search for"
                        required
                      />
                      <a href="#" className="icon icon-location">
                        {" "}
                      </a>
                    </div>
                  </div>
                  <div className="form-group-3 form-style">
                    <label>Keyword</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Keyword."
                      defaultValue=""
                      name="s"
                      title="Search for"
                      required
                    />
                  </div>
                </div>
                <div className="box-btn-advanced">
                  <div className="form-group-4 box-filter">
                    <a
                      onClick={() =>
                        ddContainer.current.classList.toggle("show")
                      }
                      ref={advanceBtnRef}
                      className="tf-btn btn-line filter-advanced pull-right"
                    >
                      <span className="text-1">Search advanced</span>
                      <svg
                        width={22}
                        height={22}
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.5 12.375V3.4375M5.5 12.375C5.86467 12.375 6.21441 12.5199 6.47227 12.7777C6.73013 13.0356 6.875 13.3853 6.875 13.75C6.875 14.1147 6.73013 14.4644 6.47227 14.7223C6.21441 14.9801 5.86467 15.125 5.5 15.125M5.5 12.375C5.13533 12.375 4.78559 12.5199 4.52773 12.7777C4.26987 13.0356 4.125 13.3853 4.125 13.75C4.125 14.1147 4.26987 14.4644 4.52773 14.7223C4.78559 14.9801 5.13533 15.125 5.5 15.125M5.5 15.125V18.5625M16.5 12.375V3.4375M16.5 12.375C16.8647 12.375 17.2144 12.5199 17.4723 12.7777C17.7301 13.0356 17.875 13.3853 17.875 13.75C17.875 14.1147 17.7301 14.4644 17.4723 14.7223C17.2144 14.9801 16.8647 15.125 16.5 15.125M16.5 12.375C16.1353 12.375 15.7856 12.5199 15.5277 12.7777C15.2699 13.0356 15.125 13.3853 15.125 13.75C15.125 14.1147 15.2699 14.4644 15.5277 14.7223C15.7856 14.9801 16.1353 15.125 16.5 15.125M16.5 15.125V18.5625M11 6.875V3.4375M11 6.875C11.3647 6.875 11.7144 7.01987 11.9723 7.27773C12.2301 7.53559 12.375 7.88533 12.375 8.25C12.375 8.61467 12.2301 8.96441 11.9723 9.22227C11.7144 9.48013 11.3647 9.625 11 9.625M11 6.875C10.6353 6.875 10.2856 7.01987 10.0277 7.27773C9.76987 7.53559 9.625 7.88533 9.625 8.25C9.625 8.61467 9.76987 8.96441 10.0277 9.22227C10.2856 9.48013 10.6353 9.625 11 9.625M11 9.625V18.5625"
                          stroke="#161E2D"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="tf-btn btn-search primary"
                    href="#"
                  >
                    Search <i className="icon icon-search" />
                  </button>
                </div>
              </div>
              <div ref={ddContainer} className="wd-search-form">
                <AdvanceSearch />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
