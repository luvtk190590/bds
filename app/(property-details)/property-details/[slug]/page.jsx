import PropertyDetailContent from "@/components/property/PropertyDetailContent";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import React from "react";

export async function generateMetadata({ params }) {
    return {
        title: `Chi tiết BĐS || Homelengo`,
        description: "Xem thông tin chi tiết bất động sản",
    };
}

export default function PropertyDetailPage({ params }) {
    return (
        <>
            <Header1 />
            <PropertyDetailContent slug={params.slug} />
            <Footer1 />
        </>
    );
}
