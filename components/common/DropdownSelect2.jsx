"use client";

import { useEffect, useRef, useState } from "react";
const optionsDefault = ["Newest", "Oldest", "3 days"];
export default function DropdownSelect2({
  onChange = (elm) => {},
  options = optionsDefault,
  defaultOption,
  selected,
  setSelected,
}) {
  const selectRef = useRef();

  const toggleDropdown = () => {
    selectRef.current.classList.toggle("open");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!selectRef.current.contains(event.target)) {
        selectRef.current.classList.remove("open");
      }
    };

    // Add event listeners to each dropdown element

    // Add a global click event listener to detect outside clicks
    document.addEventListener("click", handleClickOutside);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="nice-select" ref={selectRef}>
        <span onClick={() => toggleDropdown()} className="current">
          {selected || defaultOption || options[0]}
        </span>
        <ul className="list">
          {options.map((elm, i) => (
            <li
              key={i}
              onClick={() => {
                setSelected(elm);
                onChange(elm);
                toggleDropdown();
              }}
              className={`option ${
                selected == elm ? "selected" : ""
              }  text text-1`}
            >
              {elm}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
