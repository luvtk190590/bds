"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFooterSections, useSiteSettings } from "@/lib/hooks/useCmsData";

export default function Footer1() {
  const footerSections = useFooterSections();
  const settings = useSiteSettings();

  const logoSrc = settings.logo_white || "/images/logo/logo-footer@2x.png";

  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-mobile");
    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      const content = parent.querySelector(".tf-collapse-content");
      if (parent.classList.contains("open")) {
        parent.classList.remove("open");
        content.style.height = "0px";
      } else {
        parent.classList.add("open");
        content.style.height = content.scrollHeight + "px";
      }
    };
    headings.forEach(h => h.addEventListener("click", toggleOpen));
    return () => headings.forEach(h => h.removeEventListener("click", toggleOpen));
  }, []);

  return (
    <footer className="footer">
      <div className="top-footer">
        <div className="container">
          <div className="content-footer-top">
            <div className="footer-logo">
              <Link href="/">
                <Image alt="logo" width={166} height={48} src={logoSrc} />
              </Link>
            </div>
            <div className="wd-social">
              <span>Follow Us:</span>
              <ul className="list-social d-flex align-items-center">
                {(settings.facebook && settings.facebook !== "#") && (
                  <li>
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social">
                      <svg className="icon" width={9} height={16} viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.60547 9L8.00541 6.10437H5.50481V4.22531C5.50481 3.43313 5.85413 2.66094 6.97406 2.66094H8.11087V0.195625C8.11087 0.195625 7.07925 0 6.09291 0C4.03359 0 2.68753 1.38688 2.68753 3.8975V6.10437H0.398438V9H2.68753V16H5.50481V9H7.60547Z" fill="white" />
                      </svg>
                    </a>
                  </li>
                )}
                {(settings.linkedin && settings.linkedin !== "#") && (
                  <li>
                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social">
                      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.58151 16H0.264292V5.31762H3.58151V16ZM1.92111 3.86044C0.860376 3.86044 0 2.98185 0 1.92111C7.59231e-09 1.4116 0.202403 0.92296 0.562681 0.562681C0.92296 0.202403 1.4116 0 1.92111 0C2.43063 0 2.91927 0.202403 3.27955 0.562681C3.63983 0.92296 3.84223 1.4116 3.84223 1.92111C3.84223 2.98185 2.98149 3.86044 1.92111 3.86044ZM15.9968 16H12.6867V10.7999C12.6867 9.56057 12.6617 7.97125 10.962 7.97125C9.23735 7.97125 8.97306 9.31771 8.97306 10.7106V16H5.65941V5.31762H8.84091V6.77479H8.88734C9.33021 5.93549 10.412 5.04976 12.026 5.04976C15.3832 5.04976 16.0004 7.26052 16.0004 10.132V16H15.9968Z" fill="white" />
                      </svg>
                    </a>
                  </li>
                )}
                {(settings.twitter && settings.twitter !== "#") && (
                  <li>
                    <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social">
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.30314 5.92804L13.4029 0H12.1944L7.7663 5.14724L4.22958 0H0.150391L5.4986 7.78354L0.150391 14H1.35894L6.03514 8.56434L9.77017 14H13.8494L8.30284 5.92804H8.30314Z" fill="white" />
                      </svg>
                    </a>
                  </li>
                )}
                {(settings.instagram && settings.instagram !== "#") && (
                  <li>
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social">
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99812 4.66567C5.71277 4.66567 4.66383 5.71463 4.66383 7C4.66383 8.28537 5.71277 9.33433 6.99812 9.33433C8.28346 9.33433 9.3324 8.28537 9.3324 7C9.3324 5.71463 8.28346 4.66567 6.99812 4.66567ZM13.9992 7C13.9992 6.03335 14.008 5.07545 13.9537 4.11055C13.8994 2.98979 13.6437 1.99512 12.8242 1.17556C12.0029 0.35426 11.01 0.100338 9.88927 0.0460516C8.92263 -0.00823506 7.96475 0.000520879 6.99987 0.000520879C6.03323 0.000520879 5.07536 -0.00823506 4.11047 0.0460516C2.98973 0.100338 1.99508 0.356011 1.17554 1.17556C0.354253 1.99687 0.100336 2.98979 0.0460508 4.11055C-0.00823491 5.0772 0.00052087 6.0351 0.00052087 7C0.00052087 7.9649 -0.00823491 8.92455 0.0460508 9.88945C0.100336 11.0102 0.356004 12.0049 1.17554 12.8244C1.99683 13.6457 2.98973 13.8997 4.11047 13.9539C5.07711 14.0082 6.03499 13.9995 6.99987 13.9995C7.9665 13.9995 8.92438 14.0082 9.88927 13.9539C11.01 13.8997 12.0047 13.644 12.8242 12.8244C13.6455 12.0031 13.8994 11.0102 13.9537 9.88945C14.0097 8.92455 13.9992 7.96665 13.9992 7Z" fill="white" />
                      </svg>
                    </a>
                  </li>
                )}
                {(settings.youtube && settings.youtube !== "#") && (
                  <li>
                    <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social">
                      <svg width={16} height={12} viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.6657 1.76024C15.4817 1.06737 14.9395 0.521689 14.2511 0.336504C13.0033 0 8 0 8 0C8 0 2.99669 0 1.7489 0.336504C1.06052 0.521718 0.518349 1.06737 0.334336 1.76024C0 3.01611 0 5.63636 0 5.63636C0 5.63636 0 8.25661 0.334336 9.51248C0.518349 10.2053 1.06052 10.7283 1.7489 10.9135C2.99669 11.25 8 11.25 8 11.25C8 11.25 13.0033 11.25 14.2511 10.9135C14.9395 10.7283 15.4817 10.2053 15.6657 9.51248C16 8.25661 16 5.63636 16 5.63636C16 5.63636 16 3.01611 15.6657 1.76024ZM6.36363 8.01535V3.25737L10.5454 5.63642L6.36363 8.01535Z" fill="white" />
                      </svg>
                    </a>
                  </li>
                )}
                {(settings.zalo && settings.zalo !== "#") && (
                  <li>
                    <a href={settings.zalo} target="_blank" rel="noopener noreferrer" className="box-icon w-40 social" title="Zalo">
                      <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>Z</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="inner-footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="footer-cl-1">
                <p className="text-variant-2">
                  {settings.description || "Chuyên trang bất động sản uy tín — mua, bán, cho thuê nhà đất toàn quốc."}
                </p>
                <ul className="mt-12">
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-mapPinLine fs-20 text-variant-2" />
                    <p className="text-white">{settings.address || "101 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"}</p>
                  </li>
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-phone2 fs-20 text-variant-2" />
                    <a href={`tel:${(settings.phone || "0901234567").replace(/\s/g, "")}`} className="text-white caption-1">
                      {settings.phone || "0901 234 567"}
                    </a>
                  </li>
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-mail fs-20 text-variant-2" />
                    <p className="text-white">{settings.email || "info@homelengo.vn"}</p>
                  </li>
                </ul>
              </div>
            </div>
            {footerSections.map((section, index) => (
              <div key={index} className="col-lg-2 col-md-6">
                <div className={`footer-cl-${index + 2} footer-col-block`}>
                  <div className="fw-7 text-white footer-heading-mobile">
                    {section.heading}
                  </div>
                  <div className="tf-collapse-content">
                    <ul className="mt-10 navigation-menu-footer">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className="caption-1 text-variant-2"
                            {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-footer">
        <div className="container">
          <div className="content-footer-bottom">
            <div className="copyright">
              {settings.copyright || `©${new Date().getFullYear()} HomeLengo. Bản quyền thuộc về HomeLengo.`}
            </div>
            <ul className="menu-bottom">
              <li><Link href="/our-service">Điều khoản dịch vụ</Link></li>
              <li><Link href="/pricing">Chính sách bảo mật</Link></li>
              <li><Link href="/contact">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
