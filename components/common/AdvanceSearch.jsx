"use client";
import { useState } from "react";
import DropdownSelect from "./DropdownSelect";
import Slider from "rc-slider";
export default function AdvanceSearch() {
  const [price, setPrice] = useState([100, 700]);
  const [size, setSize] = useState([500, 1500]);
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
            max={1000}
            min={100}
            defaultValue={price}
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
            max={2000}
            min={20}
            defaultValue={size}
            onChange={setSize}
          />
        </div>
      </div>
      <div className="grid-2 group-box">
        <div className="group-select grid-2">
          <div className="box-select">
            <label className="title-select fw-6">Rooms</label>
            <DropdownSelect options={["All", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
          </div>
          <div className="box-select">
            <label className="title-select fw-6">Bathrooms</label>
            <DropdownSelect options={["All", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
          </div>
        </div>
        <div className="group-select grid-2">
          <div className="box-select">
            <label className="title-select fw-6">Bedrooms</label>
            <DropdownSelect options={["All", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
          </div>
          <div className="box-select">
            <label className="title-select fw-6">Type</label>
            <DropdownSelect options={["All", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
          </div>
        </div>
      </div>
      <div className="group-checkbox">
        <div className="text-1 text-black-2">Amenities:</div>
        <div className="group-amenities grid-6">
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb1"
                defaultChecked=""
              />
              <label htmlFor="cb1" className="text-cb-amenities">
                Air Condition
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input type="checkbox" className="tf-checkbox style-1" id="cb2" />
              <label htmlFor="cb2" className="text-cb-amenities">
                Cable TV
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input type="checkbox" className="tf-checkbox style-1" id="cb3" />
              <label htmlFor="cb3" className="text-cb-amenities">
                Ceiling Height
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input type="checkbox" className="tf-checkbox style-1" id="cb4" />
              <label htmlFor="cb4" className="text-cb-amenities">
                Fireplace
              </label>
            </fieldset>
          </div>
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input type="checkbox" className="tf-checkbox style-1" id="cb5" />
              <label htmlFor="cb5" className="text-cb-amenities">
                Disabled Access
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb6"
                defaultChecked=""
              />
              <label htmlFor="cb6" className="text-cb-amenities">
                Elevator
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input type="checkbox" className="tf-checkbox style-1" id="cb7" />
              <label htmlFor="cb7" className="text-cb-amenities">
                Fence
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input type="checkbox" className="tf-checkbox style-1" id="cb8" />
              <label htmlFor="cb8" className="text-cb-amenities">
                Garden
              </label>
            </fieldset>
          </div>
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb9"
                defaultChecked=""
              />
              <label htmlFor="cb9" className="text-cb-amenities">
                Floor
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb10"
              />
              <label htmlFor="cb10" className="text-cb-amenities">
                Furnishing
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb11"
                defaultChecked=""
              />
              <label htmlFor="cb11" className="text-cb-amenities">
                Garage
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb12"
              />
              <label htmlFor="cb12" className="text-cb-amenities">
                Pet Friendly
              </label>
            </fieldset>
          </div>
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb13"
              />
              <label htmlFor="cb13" className="text-cb-amenities">
                Heating
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb14"
              />
              <label htmlFor="cb14" className="text-cb-amenities">
                Intercom
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb15"
              />
              <label htmlFor="cb15" className="text-cb-amenities">
                Parking
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb16"
              />
              <label htmlFor="cb16" className="text-cb-amenities">
                WiFi
              </label>
            </fieldset>
          </div>
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb17"
              />
              <label htmlFor="cb17" className="text-cb-amenities">
                Renovation
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb18"
              />
              <label htmlFor="cb18" className="text-cb-amenities">
                Security
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb19"
              />
              <label htmlFor="cb19" className="text-cb-amenities">
                Swimming Pool
              </label>
            </fieldset>
          </div>
          <div className="box-amenities">
            <fieldset className="amenities-item">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb20"
              />
              <label htmlFor="cb20" className="text-cb-amenities">
                Window Type
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb21"
              />
              <label htmlFor="cb21" className="text-cb-amenities">
                Search property
              </label>
            </fieldset>
            <fieldset className="amenities-item mt-16">
              <input
                type="checkbox"
                className="tf-checkbox style-1"
                id="cb22"
              />
              <label htmlFor="cb22" className="text-cb-amenities">
                Construction Year
              </label>
            </fieldset>
          </div>
        </div>
      </div>
    </>
  );
}
