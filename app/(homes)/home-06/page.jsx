import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Categories from "@/components/homes/home-6/Categories";
import Properties from "@/components/homes/home-6/Properties";
import React from "react";

export const metadata = {
  title: "Home 06 || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Categories />
      <Properties />
    </>
  );
}
