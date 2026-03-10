import Banner from "@/components/common/Banner";
import Brands from "@/components/common/Brands";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Faqs from "@/components/common/Faqs";
import PageTitle from "@/components/otherPages/services/PageTitle";
import Services from "@/components/otherPages/services/Services";
import React from "react";

export const metadata = {
  title: "Our Services || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle />
      <Services />
      <Brands />
      <Testimonials />
      <Faqs />
      <Banner />
      <Footer1 />
    </>
  );
}
