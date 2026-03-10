import Brands from "@/components/common/Brands";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Agents from "@/components/common/Agents2";
import Benefit from "@/components/homes/home-2/Benefit";
import Blogs from "@/components/homes/home-2/Blogs";
import Categories from "@/components/homes/home-2/Categories";
import Hero from "@/components/homes/home-2/Hero";
import Locations from "@/components/homes/home-2/Locations";
import Properties from "@/components/homes/home-2/Properties";
import React from "react";
import Properties2 from "@/components/homes/home-2/Properties2";

export const metadata = {
  title: "Home 02 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Hero />
      <Categories />
      <Properties />
      <Benefit />
      <Locations />
      <Properties2 />
      <Agents />
      <Testimonials />
      <Blogs />
      <Brands />
      <Footer1 />
    </>
  );
}
