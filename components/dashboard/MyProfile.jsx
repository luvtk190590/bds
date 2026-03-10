"use client";
import React, { useState } from "react";
import Image from "next/image";
export default function MyProfile() {
  const [preview, setPreview] = useState("/images/avatar/account.jpg");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Set the preview to the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };
  const [preview2, setPreview2] = useState("/images/avatar/account-2.jpg");

  const handleImageUpload2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview2(reader.result); // Set the preview to the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="main-content">
      <div className="main-content-inner wrap-dashboard-content-2">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>
        <div className="widget-box-2">
          <div className="box">
            <h5 className="title">Account Settings</h5>
            <div className="box-agent-account">
              <h6>Agent Account</h6>
              <p className="note">
                Your current account type is set to agent, if you want to remove
                your agent account, and return to normal account, you must click
                the button below
              </p>
              <a href="#" className="tf-btn primary">
                Remove Agent Account
              </a>
            </div>
          </div>
          <div className="box">
            <h5 className="title">Avatar</h5>
            <div className="box-agent-avt">
              <div className="avatar">
                <Image
                  alt="avatar"
                  loading="lazy"
                  width={128}
                  height={128}
                  src={preview}
                />
              </div>
              <div className="content uploadfile">
                <p>Upload a new avatar</p>
                <div className="box-ip">
                  <input
                    type="file"
                    className="ip-file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p>JPEG 100x100</p>
              </div>
            </div>
          </div>
          <div className="box">
            <h5 className="title">Agent Poster</h5>
            <div className="box-agent-avt">
              <div className="img-poster">
                <Image
                  alt="avatar"
                  loading="lazy"
                  width={875}
                  height={500}
                  src={preview2}
                />
              </div>
              <div className="content uploadfile">
                <p>Upload a new avatar</p>
                <div className="box-ip">
                  <input
                    type="file"
                    className="ip-file"
                    accept="image/*"
                    onChange={handleImageUpload2}
                  />
                </div>
                <p>JPEG 100x100</p>
              </div>
            </div>
          </div>
          <h5 className="title">Information</h5>
          <div className="box box-fieldset">
            <label htmlFor="name">
              Full name:<span>*</span>
            </label>
            <input
              type="text"
              defaultValue="Demo Agent"
              className="form-control style-1"
            />
          </div>
          <div className="box box-fieldset">
            <label htmlFor="desc">
              Description:<span>*</span>
            </label>
            <textarea
              defaultValue={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              }
            />
          </div>
          <div className="box grid-4 gap-30">
            <div className="box-fieldset">
              <label htmlFor="company">
                Your Company:<span>*</span>
              </label>
              <input
                type="text"
                defaultValue="Your Company"
                className="form-control style-1"
              />
            </div>
            <div className="box-fieldset">
              <label htmlFor="position">
                Position:<span>*</span>
              </label>
              <input
                type="text"
                defaultValue="Your Company"
                className="form-control style-1"
              />
            </div>
            <div className="box-fieldset">
              <label htmlFor="num">
                Office Number:<span>*</span>
              </label>
              <input
                type="number"
                defaultValue={1332565894}
                className="form-control style-1"
              />
            </div>
            <div className="box-fieldset">
              <label htmlFor="address">
                Office Address:<span>*</span>
              </label>
              <input
                type="text"
                defaultValue="10 Bringhurst St, Houston, TX"
                className="form-control style-1"
              />
            </div>
          </div>
          <div className="box grid-4 gap-30 box-info-2">
            <div className="box-fieldset">
              <label htmlFor="job">
                Job:<span>*</span>
              </label>
              <input
                type="text"
                defaultValue="Realter"
                className="form-control style-1"
              />
            </div>
            <div className="box-fieldset">
              <label htmlFor="email">
                Email address:<span>*</span>
              </label>
              <input
                type="text"
                defaultValue="themeflat@gmail.com"
                className="form-control style-1"
              />
            </div>
            <div className="box-fieldset">
              <label htmlFor="phone">
                Your Phone:<span>*</span>
              </label>
              <input
                type="number"
                defaultValue={1332565894}
                className="form-control style-1"
              />
            </div>
          </div>
          <div className="box box-fieldset">
            <label htmlFor="location">
              Location:<span>*</span>
            </label>
            <input
              type="text"
              defaultValue="634 E 236th St, Bronx, NY 10466"
              className="form-control style-1"
            />
          </div>
          <div className="box box-fieldset">
            <label htmlFor="fb">
              Facebook:<span>*</span>
            </label>
            <input
              type="text"
              defaultValue="#"
              className="form-control style-1"
            />
          </div>
          <div className="box box-fieldset">
            <label htmlFor="tw">
              Twitter:<span>*</span>
            </label>
            <input
              type="text"
              defaultValue="#"
              className="form-control style-1"
            />
          </div>
          <div className="box box-fieldset">
            <label htmlFor="linkedin">
              Linkedin:<span>*</span>
            </label>
            <input
              type="text"
              defaultValue="#"
              className="form-control style-1"
            />
          </div>
          <div className="box">
            <a href="#" className="tf-btn primary">
              Save &amp; Update
            </a>
          </div>
          <h5 className="title">Change password</h5>
          <div className="box grid-3 gap-30">
            <div className="box-fieldset">
              <label htmlFor="old-pass">
                Old Password:<span>*</span>
              </label>
              <div className="box-password">
                <input
                  type="password"
                  className="form-contact style-1 password-field"
                  placeholder="Password"
                />
                <span className="show-pass">
                  <i className="icon-pass icon-eye" />
                  <i className="icon-pass icon-eye-off" />
                </span>
              </div>
            </div>
            <div className="box-fieldset">
              <label htmlFor="new-pass">
                New Password:<span>*</span>
              </label>
              <div className="box-password">
                <input
                  type="password"
                  className="form-contact style-1 password-field2"
                  placeholder="Password"
                />
                <span className="show-pass2">
                  <i className="icon-pass icon-eye" />
                  <i className="icon-pass icon-eye-off" />
                </span>
              </div>
            </div>
            <div className="box-fieldset">
              <label htmlFor="confirm-pass">
                Confirm Password:<span>*</span>
              </label>
              <div className="box-password">
                <input
                  type="password"
                  className="form-contact style-1 password-field3"
                  placeholder="Password"
                />
                <span className="show-pass3">
                  <i className="icon-pass icon-eye" />
                  <i className="icon-pass icon-eye-off" />
                </span>
              </div>
            </div>
          </div>
          <div className="box">
            <a href="#" className="tf-btn primary">
              Update Password
            </a>
          </div>
        </div>
      </div>
      <div className="footer-dashboard">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
