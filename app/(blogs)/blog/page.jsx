import Blogs1 from "@/components/blogs/Blogs1";
import PageTitle from "@/components/blogs/PageTitle";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";

export const metadata = {
  title: "Blog || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle />
      <Blogs1 />
      <Footer1 />
    </>
  );
}
