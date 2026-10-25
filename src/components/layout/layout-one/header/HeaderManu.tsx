"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProviderTypeMenuList from "@/components/catalog/ProviderTypeMenuList";

function HeaderManu() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "admin"
      ? "/admin"
      : user?.role === "provider"
        ? "/vendor-dashboard"
        : "/user-profile";

  return (
    <>
      <div className="gi-header-cat d-none d-lg-block">
        <div className="container position-relative">
          <div className="gi-nav-bar">
            {/* Category Toggle - Provider Types */}
            <div className="gi-category-icon-block">
              <div className="gi-category-menu">
                <div className="gi-category-toggle">
                  <i className="fi fi-rr-apps"></i>
                  <span className="text">Catégories</span>
                  <i
                    className="fi-rr-angle-small-down d-1199 gi-angle"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
              <div className="gi-cat-dropdown">
                <div className="gi-cat-block">
                  <ul className="gi-cat-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <ProviderTypeMenuList />
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Menu */}
            <div
              id="gi-main-menu-desk"
              className="d-none d-lg-block sticky-nav"
            >
              <div className="nav-desk">
                <div className="row">
                  <div className="col-md-12 align-self-center">
                    <div className="gi-main-menu">
                      <ul>
                        <li className="non-drop">
                          <Link href="/">
                            <i className="fi fi-rr-home nolva-nav-icon" aria-hidden="true"></i>
                            Accueil
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/evenements">
                            <i className="fi fi-rr-calendar nolva-nav-icon" aria-hidden="true"></i>
                            Événements
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/prestataires">
                            <i className="fi fi-rr-briefcase nolva-nav-icon" aria-hidden="true"></i>
                            Prestataires
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/lieux">
                            <i className="fi fi-rr-marker nolva-nav-icon" aria-hidden="true"></i>
                            Lieux
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href={accountHref}>
                            <i className="fi fi-rr-user nolva-nav-icon" aria-hidden="true"></i>
                            Mon compte
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderManu;
