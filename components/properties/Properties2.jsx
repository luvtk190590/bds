"use client";
import React, { useEffect, useReducer, useState } from "react";
import PropertyMap from "../common/PropertyMap";
import DropdownSelect from "../common/DropdownSelect";
import Link from "next/link";
import Image from "next/image";
import Slider from "rc-slider";
import { allProperties, featureOptions } from "@/data/properties";
import { initialState, reducer } from "@/context/propertyFilterReducer";
export default function Properties2() {
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
    <section className="wrapper-layout-3">
      <div className="wrap-sidebar">
        <div className="widget-sidebar">
          <div className="flat-tab flat-tab-form widget-filter-search widget-box">
            <ul className="nav-tab-form" role="tablist">
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
                <a
                  href="#forSale"
                  className="nav-link-item"
                  data-bs-toggle="tab"
                >
                  For Sale
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade active show" role="tabpanel">
                <div className="form-sl">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="wd-filter-select">
                      <div className="inner-group">
                        <div className="box">
                          <div className="form-style">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type keyword...."
                              defaultValue=""
                              name="s"
                              title="Search for"
                              required
                            />
                          </div>
                          <div className="form-style">
                            <div className="group-ip ip-icon">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Location"
                                defaultValue=""
                                name="s"
                                title="Search for"
                                required
                              />
                              <a
                                href="#"
                                className="icon-right icon-location"
                              />
                            </div>
                          </div>
                          <div className="form-style">
                            <div className="group-select">
                              <DropdownSelect
                                defaultOption="Property type"
                                onChange={allProps.setType}
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
                          <div className="form-style box-select">
                            <DropdownSelect
                              defaultOption="Room"
                              onChange={allProps.setRooms}
                              options={["All", 1, 2, 3, 4, 5]}
                            />
                          </div>
                          <div className="form-style box-select">
                            <DropdownSelect
                              defaultOption="Bathrooms"
                              onChange={allProps.setBathrooms}
                              options={["All", 1, 2, 3, 4, 5]}
                            />
                          </div>
                          <div className="form-style box-select">
                            <DropdownSelect
                              defaultOption="Bedrooms"
                              onChange={allProps.setBedrooms}
                              options={["All", 1, 2, 3, 4, 5]}
                            />
                          </div>
                        </div>
                        <div className="box">
                          <div className="form-style widget-price">
                            <div className="box-title-price">
                              <span className="title-price fw-6">Price:</span>
                              <div className="caption-price">
                                <span id="slider-range-value1" className="fw-6">
                                  {" "}
                                  ${price[0]}{" "}
                                </span>
                                <span>-</span>
                                <span id="slider-range-value2" className="fw-6">
                                  ${price[1]}
                                </span>
                              </div>
                            </div>
                            <Slider
                              range
                              // formatLabel={() => ``}
                              max={6000}
                              min={1500}
                              value={price}
                              onChange={allProps.setPrice}
                            />
                          </div>
                          <div className="form-style widget-price wd-price-2">
                            <div className="box-title-price">
                              <span className="title-price fw-6">Size:</span>
                              <div className="caption-price">
                                <span id="slider-range-value1" className="fw-6">
                                  {" "}
                                  ${size[0]}{" "}
                                </span>
                                <span>-</span>
                                <span id="slider-range-value2" className="fw-6">
                                  ${size[1]}
                                </span>
                              </div>
                            </div>
                            <Slider
                              range
                              // formatLabel={() => ``}
                              max={2500}
                              min={500}
                              value={size}
                              onChange={allProps.setSize}
                            />
                          </div>
                        </div>
                        <div className="box">
                          <div className="form-style wd-amenities">
                            <div className="group-checkbox">
                              <h6 className="title text-black-2">Amenities:</h6>
                              <div className="group-amenities">
                                {featureOptions.map((feature, index) => (
                                  <fieldset
                                    key={`cb${index + 1}`}
                                    className={`amenities-item `}
                                    onClick={() =>
                                      allProps.setFeatures(feature)
                                    }
                                  >
                                    <input
                                      readOnly
                                      checked={features.includes(feature)}
                                      type="checkbox"
                                      className="tf-checkbox style-1"
                                    />
                                    <label className="text-cb-amenities">
                                      {feature}
                                    </label>
                                  </fieldset>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <a
                          className="tf-btn btn-linemt-5 clear-filter"
                          onClick={clearFilter}
                        >
                          Clear Filter
                        </a>
                        <div className="form-style">
                          <button
                            type="submit"
                            className="tf-btn btn-view primary hover-btn-view"
                          >
                            Find Properties
                            <span className="icon icon-arrow-right2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wrap-inner">
        <div className="box-title-listing">
          <h3 className="fw-8">Property Listing</h3>
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
                {sorted.slice(0, 6).map((elm, i) => (
                  <div key={i} className="col-md-6">
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
            </div>
            <div
              className="tab-pane active show"
              id="listLayout"
              role="tabpanel"
            >
              <div className="row">
                {sorted.slice(0, 6).map((elm, i) => (
                  <div key={i} className="col-md-12">
                    <div className="homelengo-box list-style-1 list-style-2 line">
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
            </div>
          </div>
        </div>
      </div>
      <div className="wrap-map">
        <div id="map" className="top-map">
          <PropertyMap />
        </div>
      </div>
    </section>
  );
}
