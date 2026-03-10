import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Agents from "@/components/homes/home-3/Agents";
import Blogs from "@/components/homes/home-3/Blogs";
import Blogs2 from "@/components/homes/home-3/Blogs2";
import Categories from "@/components/homes/home-3/Categories";
import Hero from "@/components/homes/home-3/Hero";
import Locations from "@/components/homes/home-3/Locations";
import Properties from "@/components/homes/home-3/Properties";
import Services from "@/components/homes/home-3/Services";
import Testimonials from "@/components/homes/home-3/Testimonials";
import React from "react";

export const metadata = {
  title: "Home 03 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Hero />
      <Locations />
      <Properties />
      <Categories />
      <Services />
      <Brands />
      <Testimonials />
      <Agents />
      <Blogs />
      <Blogs2 />
      <Footer1 />
    </>
  );
}
