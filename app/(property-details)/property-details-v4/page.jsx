import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import DetailsTitle1 from "@/components/property-details/DetailsTitle1";
import PropertyDetails from "@/components/property-details/PropertyDetails";
import Slider3 from "@/components/property-details/Slider3";
import React from "react";

export const metadata = {
  title: "Property Details 04 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <DetailsTitle1 />
      <Slider3 />
      <PropertyDetails />
      <Footer1 />
    </>
  );
}
