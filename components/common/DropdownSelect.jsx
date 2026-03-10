"use client";

import { useEffect, useRef, useState } from "react";
const optionsDefault = ["Newest", "Oldest", "3 days"];
export default function DropdownSelect({
  onChange = (elm) => {},
  options = optionsDefault,
  defaultOption,
  addtionalParentClass = "",
}) {
  const selectRef = useRef();
  const [selected, setSelected] = useState("");
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

  // Support both plain string and { value, label } object options
  const getLabel = (elm) => (elm && typeof elm === "object" ? elm.label : elm);
  const getValue = (elm) => (elm && typeof elm === "object" ? elm.value : elm);

  return (
    <>
      <div className={`nice-select ${addtionalParentClass}`} ref={selectRef}>
        <span onClick={() => toggleDropdown()} className="current">
          {selected || defaultOption || getLabel(options[0])}
        </span>
        <ul className="list">
          {options.map((elm, i) => (
            <li
              key={i}
              onClick={() => {
                setSelected(getLabel(elm));
                onChange(getValue(elm));
                toggleDropdown();
              }}
              className={`option ${selected == getLabel(elm) ? "selected" : ""} text text-1`}
            >
              {getLabel(elm)}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
