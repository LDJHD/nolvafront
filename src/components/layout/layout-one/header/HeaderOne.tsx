"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import MobileManuSidebar from "../../../model/MobileManuSidebar";
import BottomNavMobile from "../../../model/BottomNavMobile";
import { RootState } from "@/store";
import { logout } from "@/store/reducers/authSlice";
import { accountDisplayName } from "@/lib/accountDisplay";
import NotificationBell from "@/components/notifications/NotificationBell";

function HeaderOne() {
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const displayName = accountDisplayName(user);

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "admin"
      ? "/admin"
      : user?.role === "provider"
        ? "/vendor-dashboard"
        : "/user-profile";

  const toggleMainMenu = (menuKey: any) => {
    setActiveMainMenu((prevMenu) => (prevMenu === menuKey ? null : menuKey));
  };

  const openMobileManu = () => {
    setIsMobileMenuOpen((prev: any) => !prev);
  };

  const closeMobileManu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeMobileAccount = () => {
    setIsMobileAccountOpen(false);
  };

  const handleLogout = () => {
    setIsMobileAccountOpen(false);
    dispatch(logout());
    router.push("/");
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchInput.trim();
    if (q) {
      router.push(`/recherche?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/prestataires");
    }
  };

  return (
    <>
      {/* Header mobile : logo NOLVA + actions sur une seule ligne */}
      <div className="nolva-mobile-header d-lg-none">
        <div className="nolva-mobile-header-bar">
          <Link href="/" className="nolva-mobile-header-logo" aria-label="NOLVA - Accueil">
            <img src="/assets/img/logo/nolva-logo.png" alt="NOLVA" />
          </Link>
          <div className="nolva-mobile-header-actions">
            <NotificationBell mobile />
            <div className="nolva-mobile-account">
              <button
                type="button"
                className={`nolva-mobile-account-btn${isAuthenticated ? " is-connected" : ""}`}
                onClick={() => setIsMobileAccountOpen((v) => !v)}
                aria-label={isAuthenticated ? "Mon compte" : "Connexion"}
                aria-expanded={isMobileAccountOpen}
              >
                <i className="fi fi-rr-user" aria-hidden="true"></i>
                {isAuthenticated && <span className="nolva-mobile-account-dot" aria-hidden="true" />}
              </button>
              {isMobileAccountOpen && (
                <>
                  <div className="nolva-mobile-account-backdrop" onClick={closeMobileAccount} />
                  <div className="nolva-mobile-account-menu" role="menu">
                    {isAuthenticated ? (
                      <>
                        <div className="nolva-mobile-account-head">
                          <strong>{displayName}</strong>
                          <span>{user?.email || user?.phone || ""}</span>
                        </div>
                        {user?.role === "admin" && (
                          <Link href="/admin" role="menuitem" onClick={closeMobileAccount}>
                            <i className="fi fi-rr-settings" aria-hidden="true"></i> Administration
                          </Link>
                        )}
                        {user?.role === "provider" && (
                          <Link href="/vendor-dashboard" role="menuitem" onClick={closeMobileAccount}>
                            <i className="fi fi-rr-apps" aria-hidden="true"></i> Tableau de bord
                          </Link>
                        )}
                        <Link href="/user-profile" role="menuitem" onClick={closeMobileAccount}>
                          <i className="fi fi-rr-user" aria-hidden="true"></i> Mon profil
                        </Link>
                        <Link href="/user-dashboard" role="menuitem" onClick={closeMobileAccount}>
                          <i className="fi fi-rr-calendar" aria-hidden="true"></i> Mes réservations
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="nolva-mobile-account-logout"
                          onClick={handleLogout}
                        >
                          <i className="fi fi-rr-sign-out-alt" aria-hidden="true"></i> Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" role="menuitem" onClick={closeMobileAccount}>
                          <i className="fi fi-rr-sign-in-alt" aria-hidden="true"></i> Connexion
                        </Link>
                        <Link href="/register" role="menuitem" onClick={closeMobileAccount}>
                          <i className="fi fi-rr-user-add" aria-hidden="true"></i> Créer un compte
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <form className="nolva-mobile-search" onSubmit={handleSearch} role="search" aria-label="Rechercher sur NOLVA">
          <i className="fi-rr-search nolva-mobile-search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Prestataire, ville, spécialité…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="nolva-mobile-search-btn" title="Rechercher">
            <i className="fi-rr-search" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="header-top">
        <div className="container">
          <div className="row align-itegi-center">
            <div className="col text-left header-top-left d-lg-block">
              <div className="header-top-social">
                <ul className="mb-0">
                  <li className="list-inline-item">
                    <Link href="tel:+2290195676714">
                      <i className="fi fi-rr-phone-call"></i>
                    </Link>
                    +229 01 95 67 67 14
                  </li>
                  <li className="list-inline-item">
                    <Link href="https://wa.me/2290195676714" target="_blank">
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
            {/* Mobile responsive actions (desktop top bar stays intact) */}
            <div className="col header-top-res d-lg-none">
              <div className="gi-header-bottons gi-header-buttons">
                <div className="right-icons">
                  <NotificationBell mobile />
                  <Link
                    href={accountHref}
                    className="gi-header-btn gi-header-user gi-header-rtl-btn nolva-mobile-account-btn"
                  >
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
      <BottomNavMobile />
    </>
  );
}

export default HeaderOne;
