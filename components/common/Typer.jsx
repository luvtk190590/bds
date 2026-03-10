"use client";
import React, { useEffect, useRef, useState } from "react";
const demostrings = ["Bank Account", "Web Payment", " Android & ISO"];
export default function TyperComponent({
  className = "item-text",
  strings = demostrings,
}) {
  const [activeSctingIndex, setActiveSctingIndex] = useState(0);
  const typeitRef = useRef(null);

  useEffect(() => {
    typeitRef.current.style.width =
      typeitRef.current.querySelector(".is-visible").scrollWidth + "px";

    const reapetTyping = setInterval(() => {
      typeitRef.current.style.width = "0px";
      setTimeout(() => {
        setActiveSctingIndex((pre) => {
          if (pre == strings.length - 1) {
            return 0;
          } else {
            return pre + 1;
          }
        });
        setTimeout(() => {
          if (typeitRef.current) {
            typeitRef.current.style.width =
              typeitRef.current.querySelector(".is-visible").scrollWidth + "px";
          }
        }, 10);
      }, 600);
    }, 3000);

    // Cleanup function to destroy the Typed instance
    return () => {
      clearInterval(reapetTyping);
    };
  }, []);
  return (
    <span ref={typeitRef} className="tf-text s1 cd-words-wrapper typeanimation">
      {strings.map((elm, i) => (
        <span
          key={i}
          className={`${className} ${
            activeSctingIndex == i ? "is-visible" : "is-hidden"
          } `}
        >
          {elm}
        </span>
      ))}
    </span>
  );
}
