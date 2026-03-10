import Banner from "@/components/common/Banner";
import Faqs from "@/components/common/Faqs";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Contact from "@/components/otherPages/Contact";
import PageTitle3 from "@/components/otherPages/PageTitle3";
import React from "react";

export const metadata = {
  title: "Contact || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle3 />
      <Contact />
      <Faqs />
      <Banner />
      <Footer1 />
    </>
  );
}
