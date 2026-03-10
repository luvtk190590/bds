import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Properties5 from "@/components/properties/Properties5";
import React from "react";

export const metadata = {
  title:
    "Topmap List Property || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <Properties5 />
      <Footer1 />
    </>
  );
}
