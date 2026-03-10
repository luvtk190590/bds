import Blogs2 from "@/components/blogs/Blogs2";

import PageTitle2 from "@/components/blogs/PageTitle2";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";

export const metadata = {
  title: "Blog Grid || Homelengo - Real Estate React Nextjs Template",
  description: "Homelengo - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <PageTitle2 />
      <Blogs2 />
      <Footer1 />
    </>
  );
}
