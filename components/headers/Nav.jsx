"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useMenuItems } from "@/lib/hooks/useCmsData";

export default function Nav() {
  const pathname = usePathname();
  const menuItems = useMenuItems("main");

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
                <Link
                  href={link.href}
                  {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >{link.label}</Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </>
  );
}
