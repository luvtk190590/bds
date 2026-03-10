import Agents2 from "@/components/common/Agents2";
import Brands from "@/components/common/Brands";
import Locations from "@/components/common/Locations";
import Testimonials2 from "@/components/common/Testimonials2";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Benefits from "@/components/homes/home-5/Benefits";
import Blogs from "@/components/homes/home-5/Blogs";
import Blogs2 from "@/components/homes/home-5/Blogs2";
import Filter from "@/components/homes/home-5/Filter";
import Hero from "@/components/homes/home-5/Hero";
import Properties from "@/components/homes/home-5/Properties";
import Services from "@/components/homes/home-5/Services";
import TopProperty from "@/components/homes/home-5/TopProperty";
import React from "react";

export const metadata = {
  title: "Home 05 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 parentClass="main-header header-fixed fixed-header header-style-2" />
      <Hero />
      <Filter />
      <Services />
      <Properties />
      <Locations />
      <TopProperty />
      <Testimonials2 parentClass="flat-section pt-0" />
      <Brands />
      <Benefits />
      <Agents2 />
      <Blogs />
      <Blogs2 />
      <Footer1 />
    </>
  );
}
