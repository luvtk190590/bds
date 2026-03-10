import PropertyForm from "@/components/property/PropertyForm";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import Header2 from "@/components/headers/Header2";
import React from "react";

export const metadata = {
  title: "Đăng tin BĐS || Homelengo - Sàn giao dịch Bất Động Sản",
  description: "Đăng tin bán hoặc cho thuê bất động sản của bạn",
};

export default function AddPropertyPage() {
  return (
    <>
      <div className="layout-wrap">
        <Header2 />
        <SidebarMenu />
        <PropertyForm />
        <div className="overlay-dashboard" />
      </div>
    </>
  );
}
