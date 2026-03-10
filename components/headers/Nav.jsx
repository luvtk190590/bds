"use client";
import { menuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item, index) => (
        <li
          key={index}
          className={`dropdown2 ${item.links.some(
            (el) => el.href.split("?")[0] === pathname
          )
            ? "current"
            : ""
            }`}
        >
          <a>{item.title}</a>
          <ul>
            {item.links.map((link, linkIndex) => (
              <li
                key={linkIndex}
                className={
                  pathname === link.href.split("?")[0] ? "current" : ""
                }
              >
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </>
  );
}
