"use client";
import React, { useEffect } from "react";
import Nav from "./Nav";

export default function MobileNav() {
  useEffect(() => {
    // Select all elements with the class 'dropdown2' inside '.mobile-nav'
    const dropdowns = document.querySelectorAll(".mobile-nav .dropdown2");

    // Define a function to handle the click
    const handleClick = (event) => {
      // Remove the 'open' class from all dropdowns
      const currentDropdown = event.currentTarget;
      dropdowns.forEach((item) => {
        if (currentDropdown != item) {
          item.classList.remove("open");
          const ulElement = item.querySelector("ul");
          if (ulElement) ulElement.style.height = "0px";
          if (ulElement) ulElement.style.padding = "0px 20px";
        }
      });

      // Toggle the 'open' class on the clicked dropdown

      if (!currentDropdown.classList.contains("open")) {
        // Collapse the dropdown
        currentDropdown.classList.add("open");
        const ulElement = currentDropdown.querySelector("ul");
        if (ulElement)
          ulElement.style.height = `${ulElement.scrollHeight + 30}px`;
        ulElement.style.padding = "15px 20px";
      } else {
        currentDropdown.classList.remove("open");
        const ulElement = currentDropdown.querySelector("ul");
        if (ulElement) ulElement.style.height = "0px";
        if (ulElement) ulElement.style.padding = "0px 20px";
        // Expand the dropdown
      }
    };

    // Add click event listener to each dropdown
    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener("click", handleClick);
    });

    // Cleanup function to remove event listeners on component unmount
    return () => {
      dropdowns.forEach((dropdown) => {
        dropdown.removeEventListener("click", handleClick);
      });
      document.body.classList.remove("mobile-menu-visible");
    };
  }, []);
  return (
    <div
      className="navbar-collapse collapse clearfix"
      id="navbarSupportedContent"
    >
      <ul className="navigation clearfix mobile-nav">
        <Nav />
      </ul>
    </div>
  );
}
