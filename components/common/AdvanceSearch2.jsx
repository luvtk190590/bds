"use client";

import DropdownSelect from "./DropdownSelect";
import Slider from "rc-slider";
import { featureOptions } from "@/data/properties";
import DropdownSelect2 from "./DropdownSelect2";
export default function AdvanceSearch2({ allProps, clearFilter = () => {} }) {
  const {
    price,
    setPrice,
    size,
    setSize,
    setRooms,
    setBedrooms,
    setBathrooms,
    type,
    setType,
    features,
    setFeatures,
  } = allProps;

  return (
    <>
      <div className="grid-2 group-box group-price">
        <div className="widget-price">
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
            onChange={setPrice}
          />{" "}
        </div>
        <div className="widget-price">
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
            onChange={setSize}
          />
        </div>
      </div>
      <div className="grid-2 group-box">
        <div className="group-select grid-2">
          <div className="box-select">
            <label className="title-select fw-6">Rooms</label>
            <DropdownSelect
              onChange={setRooms}
              options={["All", 1, 2, 3, 4, 5]}
            />
          </div>
          <div className="box-select">
            <label className="title-select fw-6">Bathrooms</label>
            <DropdownSelect
              onChange={setBathrooms}
              options={["All", 1, 2, 3, 4, 5]}
            />
          </div>
        </div>
        <div className="group-select grid-2">
          <div className="box-select">
            <label className="title-select fw-6">Bedrooms</label>
            <DropdownSelect
              onChange={setBedrooms}
              options={["All", 1, 2, 3, 4, 5]}
            />
          </div>
          <div className="box-select">
            <label className="title-select fw-6">Type</label>
            <DropdownSelect2
              selected={type}
              setSelected={setType}
              options={["All", "Villa", "Studio", "Office", "House"]}
            />
          </div>
        </div>
      </div>
      <div className="group-checkbox">
        <div className="text-1 text-black-2">Amenities:</div>
        <div className="group-amenities grid-6">
          {featureOptions.map((feature, index) => (
            <fieldset
              key={`cb${index + 1}`}
              className={`amenities-item ${index % 4 !== 0 ? "mt-16" : ""}`}
              onClick={() => setFeatures(feature)}
            >
              <input
                readOnly
                checked={features.includes(feature)}
                type="checkbox"
                className="tf-checkbox style-1"
              />
              <label className="text-cb-amenities">{feature}</label>
            </fieldset>
          ))}
        </div>
      </div>
      <a
        className="tf-btn btn-linemt-5 clear-filter mt-3"
        onClick={clearFilter}
      >
        Clear Filter
      </a>
    </>
  );
}
