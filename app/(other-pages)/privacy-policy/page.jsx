import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import PageTitle5 from "@/components/otherPages/PageTitle5";
import PrivacyPolicy from "@/components/otherPages/PrivacyPolicy";
import React from "react";

export const metadata = {
  title: "Privacy Policy || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle5 />
      <PrivacyPolicy />
      <Footer1 />
    </>
  );
}
