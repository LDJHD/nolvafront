"use client";

import Link from "next/link";
import { useState } from "react";
import MobileManuSidebar from "../../../model/MobileManuSidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import NotificationBell from "@/components/notifications/NotificationBell";

function HeaderOne() {
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const toggleMainMenu = (menuKey: any) => {
    setActiveMainMenu((prevMenu) => (prevMenu === menuKey ? null : menuKey));
  };

  const openMobileManu = () => {
    setIsMobileMenuOpen((prev: any) => !prev);
  }

  const closeMobileManu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className="header-top">
        <div className="container">
          <div className="row align-itegi-center">
            <div className="col text-left header-top-left d-lg-block">
              <div className="header-top-social">
                <ul className="mb-0">
                  <li className="list-inline-item">
                    <Link href="tel:+22990000000">
                      <i className="fi fi-rr-phone-call"></i>
                    </Link>
                    +229 90 00 00 00
                  </li>
                  <li className="list-inline-item">
                    <Link href="https://wa.me/22990000000" target="_blank">
                      <i className="fi fi-brands-whatsapp"></i>
                    </Link>
                    WhatsApp
                  </li>
                </ul>
              </div>
            </div>
            <div className="col text-center header-top-center">
              <div className="header-top-message">
                Trouvez le prestataire idéal pour votre événement au Bénin
              </div>
            </div>
            <div className="col header-top-right d-none d-lg-block">
              <div className="header-top-right-inner d-flex justify-content-end">
                <Link className="gi-help" href="/about-us">
                  À propos
                </Link>
                <Link className="gi-help" href="/faq">
                  Aide
                </Link>
                <Link className="gi-help" href="/contact-us">
                  Contact
                </Link>
              </div>
            </div>
            {/* Mobile responsive actions */}
            <div className="col header-top-res d-lg-none">
              <div className="gi-header-bottons gi-header-buttons">
                <div className="right-icons">
                  <NotificationBell mobile />
                  <Link href={isAuthenticated ? "/user-profile" : "/login"} className="gi-header-btn gi-header-user gi-header-rtl-btn nolva-mobile-account-btn">
                    <div className="header-icon">
                      <i className="fi-rr-user"></i>
                    </div>
                  </Link>
                  <Link
                    href=""
                    onClick={openMobileManu}
                    className="gi-header-btn gi-site-menu-icon d-lg-none"
                  >
                    <i className="fi-rr-menu-burger"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileManuSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileManu={closeMobileManu}
        toggleMainMenu={toggleMainMenu}
        activeMainMenu={activeMainMenu}
      />
    </>
  );
}

export default HeaderOne;
