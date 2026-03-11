"use client";
import { useEffect } from "react";
import "../public/scss/styles.scss";
import "photoswipe/dist/photoswipe.css";
import "react-modal-video/scss/modal-video.scss";
import "rc-slider/assets/index.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";
import LoginModals from "@/components/modals/LoginModals";
import Register from "@/components/modals/Register";
import BackToTop from "@/components/common/BackToTop";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm").then(() => { });
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    const { WOW } = require("wowjs");
    const wow = new WOW({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);

  return (
    <html lang="vi">
      <body className="body">
        <AuthProvider>
          <div id="wrapper">
            <div id="pagee" className="clearfix">
              {children}
            </div>
          </div>
          <Suspense><LoginModals /></Suspense>
          <Register />
          <BackToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
