import PendingProperties from "@/components/dashboard/PendingProperties";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import Header2 from "@/components/headers/Header2";
import React from "react";

export const metadata = {
    title: "Duyệt tin đăng || Homelengo - Sàn giao dịch Bất Động Sản",
    description: "Quản lý và duyệt các tin đăng bất động sản chờ phê duyệt",
};

export default function PendingPropertiesPage() {
    return (
        <>
            <div className="layout-wrap">
                <Header2 />
                <SidebarMenu />
                <PendingProperties />
                <div className="overlay-dashboard" />
            </div>
        </>
    );
}
