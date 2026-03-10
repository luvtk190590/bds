import Agents from "@/components/common/Agents";
import Benefit from "@/components/common/Benefit";
import Brands from "@/components/common/Brands";
import Locations from "@/components/common/Locations";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Banner from "@/components/common/Banner";
import Blogs from "@/components/homes/home-4/Blogs";
import Properties from "@/components/homes/home-4/Properties";
import Services from "@/components/homes/home-4/Services";
import Testimonials from "@/components/common/Testimonials2";
import TopProperty from "@/components/homes/home-4/TopProperty";
import React from "react";
import Hero from "@/components/homes/home-4/Hero";

export const metadata = {
  title: "Home 04 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Hero />
      <Properties />
      <Services />
      <Locations parentClass="flat-section flat-location px-10  mb-0 pb-0" />
      <Agents />
      <Brands />
      <TopProperty />
      <Testimonials />
      <Benefit />
      <Blogs />
      <Banner />
      <Footer1 />
    </>
  );
}
