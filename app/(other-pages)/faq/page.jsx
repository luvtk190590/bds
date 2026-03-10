import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import Faqs from "@/components/otherPages/Faqs";
import PageTitle4 from "@/components/otherPages/PageTitle4";
import React from "react";

export const metadata = {
  title: "Faq || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle4 />
      <Faqs />
      <Footer1 />
    </>
  );
}
