"use client";
import React from "react";
import Link from "next/link";
import CurrentLocation from "./CurrentLocation";
import ProviderTypeMenuList from "@/components/catalog/ProviderTypeMenuList";

function HeaderManu() {
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
                          <Link href="/">Accueil</Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/prestataires">
                            Prestataires
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/evenements">
                            Événements
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/demande-devis">
                            <i className="fi-rr-document" style={{ marginRight: "5px" }}></i>
                            Demande de devis
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/about-us">
                            À propos
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/contact-us">
                            Contact
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <CurrentLocation /> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderManu;
