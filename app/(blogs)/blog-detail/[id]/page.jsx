import BlogDetails from "@/components/blogs/BlogDetails";
import PageTitle from "@/components/blogs/PageTitle";
import Footer1 from "@/components/footer/Footer1";
import Header1 from "@/components/headers/Header1";
import { createClient } from "@supabase/supabase-js";
import React from "react";

export const metadata = {
  title: "Chi tiết bài viết || Homelengo",
  description: "Homelengo - Bất động sản",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function page({ params }) {
  const { data: blogItem } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!blogItem) {
    return <div className="text-center py-5">Bài viết không tồn tại.</div>;
  }

  return (
    <>
      <Header1 />
      <PageTitle />
      <BlogDetails blogItem={blogItem} />
      <Footer1 />
    </>
  );
}
