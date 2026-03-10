import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import PropertyDetails2 from "@/components/property-details/PropertyDetails2";
import Slider2 from "@/components/property-details/Slider2";
import React from "react";

export const metadata = {
  title: "Property Details 02 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Slider2 />
      <PropertyDetails2 />
      <Footer1 />
    </>
  );
}
