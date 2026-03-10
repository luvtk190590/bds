import Dashboard from "@/components/dashboard/Dashboard";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import Header2 from "@/components/headers/Header2";
import React from "react";

export const metadata = {
  title: "Dashboard || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <div className="layout-wrap">
        <Header2 />
        <SidebarMenu />
        <Dashboard />
        <div className="overlay-dashboard" />
      </div>
    </>
  );
}
