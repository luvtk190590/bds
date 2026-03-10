import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import DetailsTitle1 from "@/components/property-details/DetailsTitle1";
import PropertyDetails from "@/components/property-details/PropertyDetails";
import Slider1 from "@/components/property-details/Slider1";
import { allProperties } from "@/data/properties";
import React from "react";

export const metadata = {
  title: "Property Details 01 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page({ params }) {
  const propertyItem =
    allProperties.filter((elm) => elm.id == params.id)[0] || allProperties[0];
  return (
    <>
      <Header1 />
      <DetailsTitle1 propertyItem={propertyItem} />
      <Slider1 />
      <PropertyDetails />
      <Footer1 />
    </>
  );
}
