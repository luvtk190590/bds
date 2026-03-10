"use client";
import React, { useEffect, useReducer, useRef, useState } from "react";
import PropertyMap from "../common/PropertyMap";

import DropdownSelect from "../common/DropdownSelect";
import Link from "next/link";
import Image from "next/image";
import Pagination from "../common/Pagination";
import AdvanceSearch2 from "../common/AdvanceSearch2";
import { allProperties } from "@/data/properties";
import DropdownSelect2 from "../common/DropdownSelect2";
import { initialState, reducer } from "@/context/propertyFilterReducer";
export default function Properties5() {
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

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    price,
    size,
    rooms,
    bedrooms,
    bathrooms,
    type,
    features,
    filtered,
    sortingOption,
    sorted,
    currentPage,
    itemPerPage,
  } = state;

  const clearFilter = () => {
    dispatch({ type: "CLEAR_FILTER" });
  };

  useEffect(() => {
    let filteredArrays = [];

    if (features.length) {
      const filteredByFeatures = [...allProperties].filter((elm) =>
        features.every((el) => elm.features.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByFeatures];
    }
    if (rooms !== "All") {
      const filteredByRooms = [...allProperties].filter(
        (elm) => rooms === elm.rooms
      );
      filteredArrays = [...filteredArrays, filteredByRooms];
    }
    if (bedrooms !== "All") {
      const filteredByBedrooms = [...allProperties].filter(
        (elm) => bedrooms === elm.beds
      );
      filteredArrays = [...filteredArrays, filteredByBedrooms];
    }
    if (bathrooms !== "All") {
      const filteredByBathrooms = [...allProperties].filter(
        (elm) => bathrooms === elm.baths
      );
      filteredArrays = [...filteredArrays, filteredByBathrooms];
    }
    if (type !== "All") {
      const filteredByType = [...allProperties].filter((elm) =>
        elm.type.includes(type)
      );
      filteredArrays = [...filteredArrays, filteredByType];
    }
    const filteredByPrice = [...allProperties].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];
    const filteredBySize = [...allProperties].filter(
      (elm) => elm.sqft >= size[0] && elm.sqft <= size[1]
    );
    filteredArrays = [...filteredArrays, filteredBySize];

    const commonItems = [...allProperties].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, size, rooms, bedrooms, bathrooms, type, features, allProperties]);

  useEffect(() => {
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  const allProps = {
    price,
    setPrice: (newPrice) => dispatch({ type: "SET_PRICE", payload: newPrice }),
    size,
    setSize: (newSize) => dispatch({ type: "SET_SIZE", payload: newSize }),
    setRooms: (newRooms) => dispatch({ type: "SET_ROOMS", payload: newRooms }),
    setBedrooms: (newBedrooms) =>
      dispatch({ type: "SET_BEDROOMS", payload: newBedrooms }),
    setBathrooms: (newBathrooms) =>
      dispatch({ type: "SET_BATHROOMS", payload: newBathrooms }),
    type,
    setType: (newType) => dispatch({ type: "SET_TYPE", payload: newType }),
    features,
    setFeatures: (newFeature) => {
      const updated = [...features].includes(newFeature)
        ? [...features].filter((elm) => elm != newFeature)
        : [...features, newFeature];
      dispatch({ type: "SET_FEATURES", payload: updated });
    },
  };
  return (
    <>
      {/* Map */}
      <section className="flat-map">
        <div id="map" className="top-map">
          <PropertyMap />
        </div>
        <div className="container">
          <div className="wrap-filter-search">
            <div className="form-sl">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="wd-find-select shadow-3">
                  <div className="inner-group">
                    <div className="form-group-1 search-form form-style">
                      <label>Type</label>
                      <div className="group-select">
                        <DropdownSelect2
                          selected={type}
                          setSelected={allProps.setType}
                          options={[
                            "All",
                            "Villa",
                            "Studio",
                            "Office",
                            "House",
                          ]}
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
                        className="tf-btn btn-line filter-advanced pull-right"
                        onClick={() =>
                          ddContainer.current.classList.toggle("show")
                        }
                        ref={advanceBtnRef}
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
                  <AdvanceSearch2
                    clearFilter={clearFilter}
                    allProps={allProps}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Map */}
      <section className="flat-section flat-recommended">
        <div className="container">
          <div className="box-title-listing">
            <div className="box-left">
              <h3 className="fw-8">Property Listing</h3>
              <p className="text">
                There are currently {sorted.length} properties.
              </p>
            </div>
            <div className="box-filter-tab">
              <ul className="nav-tab-filter" role="tablist">
                <li className="nav-tab-item" role="presentation">
                  <a
                    href="#gridLayout"
                    className="nav-link-item"
                    data-bs-toggle="tab"
                  >
                    <svg
                      className="icon"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.54883 5.90508C4.54883 5.1222 5.17272 4.5 5.91981 4.5C6.66686 4.5 7.2908 5.12221 7.2908 5.90508C7.2908 6.68801 6.66722 7.3101 5.91981 7.3101C5.17241 7.3101 4.54883 6.68801 4.54883 5.90508Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M10.6045 5.90508C10.6045 5.12221 11.2284 4.5 11.9755 4.5C12.7229 4.5 13.3466 5.1222 13.3466 5.90508C13.3466 6.68789 12.7227 7.3101 11.9755 7.3101C11.2284 7.3101 10.6045 6.68794 10.6045 5.90508Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M19.4998 5.90514C19.4998 6.68797 18.8757 7.31016 18.1288 7.31016C17.3818 7.31016 16.7578 6.68794 16.7578 5.90508C16.7578 5.12211 17.3813 4.5 18.1288 4.5C18.8763 4.5 19.4998 5.12215 19.4998 5.90514Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M7.24249 12.0098C7.24249 12.7927 6.61849 13.4148 5.87133 13.4148C5.12411 13.4148 4.5 12.7926 4.5 12.0098C4.5 11.2268 5.12419 10.6045 5.87133 10.6045C6.61842 10.6045 7.24249 11.2267 7.24249 12.0098Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M13.2976 12.0098C13.2976 12.7927 12.6736 13.4148 11.9266 13.4148C11.1795 13.4148 10.5557 12.7928 10.5557 12.0098C10.5557 11.2266 11.1793 10.6045 11.9266 10.6045C12.6741 10.6045 13.2976 11.2265 13.2976 12.0098Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M19.4516 12.0098C19.4516 12.7928 18.828 13.4148 18.0807 13.4148C17.3329 13.4148 16.709 12.7926 16.709 12.0098C16.709 11.2268 17.3332 10.6045 18.0807 10.6045C18.8279 10.6045 19.4516 11.2266 19.4516 12.0098Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M4.54297 18.0945C4.54297 17.3116 5.16709 16.6895 5.9143 16.6895C6.66137 16.6895 7.28523 17.3114 7.28523 18.0945C7.28523 18.8776 6.66139 19.4996 5.9143 19.4996C5.16714 19.4996 4.54297 18.8771 4.54297 18.0945Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M10.5986 18.0945C10.5986 17.3116 11.2227 16.6895 11.97 16.6895C12.7169 16.6895 13.3409 17.3115 13.3409 18.0945C13.3409 18.8776 12.7169 19.4996 11.97 19.4996C11.2225 19.4996 10.5986 18.8772 10.5986 18.0945Z"
                        stroke="#A3ABB0"
                      />
                      <path
                        d="M16.752 18.0945C16.752 17.3115 17.376 16.6895 18.1229 16.6895C18.8699 16.6895 19.4939 17.3115 19.4939 18.0945C19.4939 18.8776 18.8702 19.4996 18.1229 19.4996C17.376 19.4996 16.752 18.8772 16.752 18.0945Z"
                        stroke="#A3ABB0"
                      />
                    </svg>
                  </a>
                </li>
                <li className="nav-tab-item" role="presentation">
                  <a
                    href="#listLayout"
                    className="nav-link-item active"
                    data-bs-toggle="tab"
                  >
                    <svg
                      className="icon"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.2016 17.8316H8.50246C8.0615 17.8316 7.7041 17.4742 7.7041 17.0332C7.7041 16.5923 8.0615 16.2349 8.50246 16.2349H19.2013C19.6423 16.2349 19.9997 16.5923 19.9997 17.0332C19.9997 17.4742 19.6426 17.8316 19.2016 17.8316Z"
                        fill="#A3ABB0"
                      />
                      <path
                        d="M19.2016 12.8199H8.50246C8.0615 12.8199 7.7041 12.4625 7.7041 12.0215C7.7041 11.5805 8.0615 11.2231 8.50246 11.2231H19.2013C19.6423 11.2231 19.9997 11.5805 19.9997 12.0215C20 12.4625 19.6426 12.8199 19.2016 12.8199Z"
                        fill="#A3ABB0"
                      />
                      <path
                        d="M19.2016 7.80913H8.50246C8.0615 7.80913 7.7041 7.45173 7.7041 7.01077C7.7041 6.5698 8.0615 6.2124 8.50246 6.2124H19.2013C19.6423 6.2124 19.9997 6.5698 19.9997 7.01077C19.9997 7.45173 19.6426 7.80913 19.2016 7.80913Z"
                        fill="#A3ABB0"
                      />
                      <path
                        d="M5.0722 8.1444C5.66436 8.1444 6.1444 7.66436 6.1444 7.0722C6.1444 6.48004 5.66436 6 5.0722 6C4.48004 6 4 6.48004 4 7.0722C4 7.66436 4.48004 8.1444 5.0722 8.1444Z"
                        fill="#A3ABB0"
                      />
                      <path
                        d="M5.0722 13.0941C5.66436 13.0941 6.1444 12.6141 6.1444 12.0219C6.1444 11.4297 5.66436 10.9497 5.0722 10.9497C4.48004 10.9497 4 11.4297 4 12.0219C4 12.6141 4.48004 13.0941 5.0722 13.0941Z"
                        fill="#A3ABB0"
                      />
                      <path
                        d="M5.0722 18.0433C5.66436 18.0433 6.1444 17.5633 6.1444 16.9711C6.1444 16.379 5.66436 15.8989 5.0722 15.8989C4.48004 15.8989 4 16.379 4 16.9711C4 17.5633 4.48004 18.0433 5.0722 18.0433Z"
                        fill="#A3ABB0"
                      />
                    </svg>
                  </a>
                </li>
              </ul>

              <DropdownSelect
                onChange={(value) => {
                  const match = value.match(/\d+/); // Match the digits in the value
                  if (match) {
                    dispatch({
                      type: "SET_ITEM_PER_PAGE",
                      payload: parseInt(match[0], 10),
                    });

                    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
                  }
                }}
                addtionalParentClass="list-page"
                options={["Show: 6", "Show: 9", "Show: 12"]}
              />

              <DropdownSelect
                onChange={(value) =>
                  dispatch({ type: "SET_SORTING_OPTION", payload: value })
                }
                addtionalParentClass="list-sort"
                options={[
                  "Sort by (Default)",

                  "Price Ascending",
                  "Price Descending",
                ]}
              />
            </div>
          </div>
          <div className="flat-animate-tab">
            <div className="tab-content">
              <div className="tab-pane" id="gridLayout" role="tabpanel">
                <div className="row">
                  {sorted
                    .slice(
                      (currentPage - 1) * itemPerPage,
                      currentPage * itemPerPage
                    )
                    .map((elm, i) => (
                      <div
                        key={i}
                        className="col-xl-4 col-lg-6 col-md-6
"
                      >
                        <div className="homelengo-box">
                          <div className="archive-top">
                            <Link
                              href={`/property-details-v1/${elm.id}`}
                              className="images-group"
                            >
                              <div className="images-style">
                                <Image
                                  className="lazyload"
                                  alt="img"
                                  src={elm.imgSrc}
                                  width={615}
                                  height={405}
                                />
                              </div>
                              <div className="top">
                                <ul className="d-flex gap-6">
                                  <li className="flag-tag primary">Featured</li>
                                  <li className="flag-tag style-1">For Sale</li>
                                </ul>
                              </div>
                              <div className="bottom">
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M10 7C10 7.53043 9.78929 8.03914 9.41421 8.41421C9.03914 8.78929 8.53043 9 8 9C7.46957 9 6.96086 8.78929 6.58579 8.41421C6.21071 8.03914 6 7.53043 6 7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7Z"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M13 7C13 11.7613 8 14.5 8 14.5C8 14.5 3 11.7613 3 7C3 5.67392 3.52678 4.40215 4.46447 3.46447C5.40215 2.52678 6.67392 2 8 2C9.32608 2 10.5979 2.52678 11.5355 3.46447C12.4732 4.40215 13 5.67392 13 7Z"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {elm.address}
                              </div>
                            </Link>
                          </div>
                          <div className="archive-bottom">
                            <div className="content-top">
                              <h6 className="text-capitalize">
                                <Link
                                  href={`/property-details-v1/${elm.id}`}
                                  className="link"
                                >
                                  {elm.title}
                                </Link>
                              </h6>
                              <ul className="meta-list">
                                <li className="item">
                                  <i className="icon icon-bed" />
                                  <span className="text-variant-1">Beds:</span>
                                  <span className="fw-6">{elm.beds}</span>
                                </li>
                                <li className="item">
                                  <i className="icon icon-bath" />
                                  <span className="text-variant-1">Baths:</span>
                                  <span className="fw-6">{elm.baths}</span>
                                </li>
                                <li className="item">
                                  <i className="icon icon-sqft" />
                                  <span className="text-variant-1">Sqft:</span>
                                  <span className="fw-6">{elm.sqft}</span>
                                </li>
                              </ul>
                            </div>
                            <div className="content-bottom">
                              <div className="d-flex gap-8 align-items-center">
                                <div className="avatar avt-40 round">
                                  <Image
                                    alt="avt"
                                    src={elm.avatar}
                                    width={34}
                                    height={34}
                                  />
                                </div>
                                <span>{elm.agent}</span>
                              </div>
                              <h6 className="price">
                                ${elm.price.toLocaleString()}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <ul className="justify-content-center wd-navigation mt-20">
                  <Pagination
                    currentPage={currentPage}
                    setPage={(value) =>
                      dispatch({ type: "SET_CURRENT_PAGE", payload: value })
                    }
                    itemLength={sorted.length}
                    itemPerPage={itemPerPage}
                  />
                </ul>
              </div>
              <div
                className="tab-pane active show"
                id="listLayout"
                role="tabpanel"
              >
                <div className="row">
                  {sorted
                    .slice(
                      (currentPage - 1) * itemPerPage,
                      currentPage * itemPerPage
                    )
                    .map((elm, i) => (
                      <div key={i} className="col-md-6">
                        <div className="homelengo-box list-style-1 line">
                          <div className="archive-top">
                            <Link
                              href={`/property-details-v1/${elm.id}`}
                              className="images-group"
                            >
                              <div className="images-style">
                                <Image
                                  className="lazyload"
                                  alt="img-property"
                                  src={elm.imgSrc}
                                  width={344}
                                  height={315}
                                />
                              </div>
                              <div className="top">
                                <ul className="d-flex gap-6 flex-wrap">
                                  <li className="flag-tag primary">Featured</li>
                                  <li className="flag-tag style-1">For Sale</li>
                                </ul>
                              </div>
                            </Link>
                          </div>
                          <div className="archive-bottom">
                            <div className="content-top">
                              <h6 className="text-capitalize">
                                <Link
                                  href={`/property-details-v1/${elm.id}`}
                                  className="link text-line-clamp-1"
                                >
                                  {elm.title}
                                </Link>
                              </h6>
                              <ul className="meta-list">
                                <li className="item">
                                  <i className="icon icon-bed" />
                                  <span className="text-variant-1">Beds:</span>
                                  <span className="fw-6">{elm.beds}</span>
                                </li>
                                <li className="item">
                                  <i className="icon icon-bath" />
                                  <span className="text-variant-1">Baths:</span>
                                  <span className="fw-6">{elm.baths}</span>
                                </li>
                                <li className="item">
                                  <i className="icon icon-sqft" />
                                  <span className="text-variant-1">Sqft:</span>
                                  <span className="fw-6">{elm.sqft}</span>
                                </li>
                              </ul>
                              <div className="location">
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M10 7C10 7.53043 9.78929 8.03914 9.41421 8.41421C9.03914 8.78929 8.53043 9 8 9C7.46957 9 6.96086 8.78929 6.58579 8.41421C6.21071 8.03914 6 7.53043 6 7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7Z"
                                    stroke="#A3ABB0"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M13 7C13 11.7613 8 14.5 8 14.5C8 14.5 3 11.7613 3 7C3 5.67392 3.52678 4.40215 4.46447 3.46447C5.40215 2.52678 6.67392 2 8 2C9.32608 2 10.5979 2.52678 11.5355 3.46447C12.4732 4.40215 13 5.67392 13 7Z"
                                    stroke="#A3ABB0"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className="text-line-clamp-1">
                                  {elm.address}
                                </span>
                              </div>
                            </div>
                            <div className="content-bottom">
                              <div className="d-flex gap-8 align-items-center">
                                <div className="avatar avt-40 round">
                                  <Image
                                    alt="avt"
                                    src={elm.avatar}
                                    width={34}
                                    height={34}
                                  />
                                </div>
                                <span>{elm.agent}</span>
                              </div>
                              <h6 className="price">
                                ${elm.price.toLocaleString()}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <ul className="justify-content-center wd-navigation mt-20">
                  <Pagination
                    currentPage={currentPage}
                    setPage={(value) =>
                      dispatch({ type: "SET_CURRENT_PAGE", payload: value })
                    }
                    itemLength={sorted.length}
                    itemPerPage={itemPerPage}
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
