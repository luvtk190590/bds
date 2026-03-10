import { Suspense } from "react";
import PropertiesMapCustom from "@/components/properties/PropertiesMapCustom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";

export const metadata = {
    title: "Tìm kiếm Bất Động Sản || Homelengo",
    description:
        "Tìm kiếm bất động sản trên bản đồ. Lọc theo loại, giá, diện tích, vị trí. Hàng nghìn tin đăng mỗi ngày.",
};

export default function PropertiesMapPage() {
    return (
        <>
            <Header1 />
            <Suspense>
                <PropertiesMapCustom />
            </Suspense>
            <Footer1 />
        </>
    );
}
