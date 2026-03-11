"use client";
import { useState } from "react";
import Nav from "./Nav";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "./MobileNav";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import VerificationModal, { getModalStep } from "@/components/modals/VerificationModal";

export default function Header2() {
  const { profile, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const [verModalOpen, setVerModalOpen] = useState(false);

  function handleSubmitProperty(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/?login=1");
      return;
    }
    const step = getModalStep(profile);
    if (step === "can_post") {
      router.push("/add-property");
      return;
    }
    setVerModalOpen(true);
  }

  const SubmitBtn = ({ mobile = false }) => (
    <button
      type="button"
      className="tf-btn primary"
      onClick={handleSubmitProperty}
      style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {!mobile && (
        <svg width={21} height={20} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.625 14.375V17.1875C13.625 17.705 13.205 18.125 12.6875 18.125H4.5625C4.31386 18.125 4.0754 18.0262 3.89959 17.8504C3.72377 17.6746 3.625 17.4361 3.625 17.1875V6.5625C3.625 6.045 4.045 5.625 4.5625 5.625H6.125C6.54381 5.62472 6.96192 5.65928 7.375 5.72834M13.625 14.375H16.4375C16.955 14.375 17.375 13.955 17.375 13.4375V9.375C17.375 5.65834 14.6725 2.57417 11.125 1.97834C10.7119 1.90928 10.2938 1.87472 9.875 1.875H8.3125C7.795 1.875 7.375 2.295 7.375 2.8125V5.72834M13.625 14.375H8.3125C8.06386 14.375 7.8254 14.2762 7.64959 14.1004C7.47377 13.9246 7.375 13.6861 7.375 13.4375V5.72834M17.375 11.25V9.6875C17.375 8.94158 17.0787 8.22621 16.5512 7.69876C16.0238 7.17132 15.3084 6.875 14.5625 6.875H13.3125C13.0639 6.875 12.8254 6.77623 12.6496 6.60041C12.4738 6.4246 12.375 6.18614 12.375 5.9375V4.6875C12.375 4.31816 12.3023 3.95243 12.1609 3.6112C12.0196 3.26998 11.8124 2.95993 11.5512 2.69876C11.2901 2.4376 10.98 2.23043 10.6388 2.08909C10.2976 1.94775 9.93184 1.875 9.5625 1.875H8.625"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
      Đăng tin
    </button>
  );

  return (
    <>
      <header className="main-header fixed-header header-dashboard">
        <div className="header-lower">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-header">
                <div className="inner-header-left">
                  <div className="logo-box d-flex">
                    <div className="logo">
                      <Link href="/">
                        <Image alt="logo" width={174} height={44} src="/images/logo/logo@2x.png" />
                      </Link>
                    </div>
                    <div className="button-show-hide">
                      <span className="icon icon-categories" />
                    </div>
                  </div>
                  <div className="nav-outer flex align-center">
                    <nav className="main-menu show navbar-expand-md">
                      <div className="navbar-collapse collapse clearfix" id="navbarSupportedContent">
                        <ul className="navigation clearfix">
                          <Nav />
                        </ul>
                      </div>
                    </nav>
                  </div>
                </div>

                <div className="header-account inner-header-right">
                  <div className="dropdown">
                    <a
                      href="#"
                      className="box-avatar dropdown-toggle"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="avatar avt-34 round">
                        <Image
                          alt="avt"
                          src={profile?.avatar_url || "/images/avatar/avt-5.jpg"}
                          width={34}
                          height={34}
                        />
                      </div>
                      <p className="name">
                        {profile?.full_name || "User"}
                        <span className="icon icon-arr-down" />
                      </p>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" style={{ zIndex: 9999 }}>
                      <li><Link className="dropdown-item" href="/my-property">Tin đăng của tôi</Link></li>
                      <li><Link className="dropdown-item" href="/my-profile">Hồ sơ</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a className="dropdown-item" onClick={handleSubmitProperty} style={{ cursor: "pointer" }}>
                          Đăng tin BDS
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item text-danger"
                          onClick={e => { e.preventDefault(); signOut().then(() => router.push("/")); }}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="icon icon-logout" style={{ marginRight: 8 }} />Đăng xuất
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="flat-bt-top">
                    <SubmitBtn />
                  </div>
                </div>

                <div
                  className="mobile-nav-toggler mobile-button"
                  onClick={() => document.body.classList.add("mobile-menu-visible")}
                >
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="close-btn" onClick={() => document.body.classList.remove("mobile-menu-visible")}>
          <span className="icon flaticon-cancel-1" />
        </div>
        <div className="mobile-menu">
          <div className="menu-backdrop" />
          <nav className="menu-box">
            <div className="nav-logo">
              <Link href="/">
                <Image alt="nav-logo" width={174} height={44} src="/images/logo/logo@2x.png" />
              </Link>
            </div>
            <div className="bottom-canvas">
              <div className="menu-outer"><MobileNav /></div>
              <div className="button-mobi-sell"><SubmitBtn mobile /></div>
              <div className="mobi-icon-box">
                <div className="box d-flex align-items-center">
                  <span className="icon icon-phone2" />
                  <div>1-333-345-6868</div>
                </div>
                <div className="box d-flex align-items-center">
                  <span className="icon icon-mail" />
                  <div>themesflat@gmail.com</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <VerificationModal
        open={verModalOpen}
        onClose={() => setVerModalOpen(false)}
        profile={profile}
        onPostAllowed={() => { setVerModalOpen(false); router.push("/add-property"); }}
      />
    </>
  );
}
