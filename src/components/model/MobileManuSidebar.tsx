"use client";
import React, { useState } from "react";
import Link from "next/link";
import Collapse from 'react-bootstrap/Collapse';
import { useProviderTypes } from "@/lib/useCatalog";

const MobileManuSidebar = ({ isMobileMenuOpen, closeMobileManu, toggleMainMenu, activeMainMenu }) => {
  const { types: providerTypes } = useProviderTypes();

  return (
    <>
      <div
        style={{ display: isMobileMenuOpen ? "block" : "none" }}
        onClick={closeMobileManu}
        className="gi-mobile-menu-overlay"
      ></div>
      {isMobileMenuOpen && (
        <div id="gi-mobile-menu" className="gi-mobile-menu gi-menu-open">
          <div className="gi-menu-title">
            <span className="menu_title">Menu NOLVA</span>
            <button onClick={closeMobileManu} className="gi-close-menu">
              ×
            </button>
          </div>
          <div className="gi-menu-inner">
            <div className="gi-menu-content">
              <ul>
                <li>
                  <Link href="/" onClick={closeMobileManu}>
                    Accueil
                  </Link>
                </li>
                <li>
                  <span onClick={() => toggleMainMenu('prestataires')} className="menu-toggle"></span>
                  <Link href="/prestataires" onClick={() => toggleMainMenu('prestataires')}>
                    Prestataires
                  </Link>
                  <Collapse in={activeMainMenu === "prestataires"}>
                    <ul style={{ display: activeMainMenu === "prestataires" ? "block" : "none" }} className="sub-menu height-transition-1s-ease">
                      {providerTypes.slice(0, 10).map((type) => (
                        <li key={type.slug}>
                          <Link href={`/prestataires?type=${type.slug}`} onClick={closeMobileManu}>
                            {type.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </li>
                <li>
                  <Link href="/evenements" onClick={closeMobileManu}>
                    Événements
                  </Link>
                </li>
                <li>
                  <Link href="/demande-devis" onClick={closeMobileManu}>
                    Demande de devis
                  </Link>
                </li>
                <li>
                  <Link href="/about-us" onClick={closeMobileManu}>
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" onClick={closeMobileManu}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={closeMobileManu}>
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>
            <div className="header-res-lan-curr">
              <div className="header-res-social">
                <div className="header-top-social">
                  <ul className="mb-0">
                    <li className="list-inline-item">
                      <a href="#"><i className="gicon gi-facebook"></i></a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#"><i className="gicon gi-instagram"></i></a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#"><i className="gicon gi-twitter"></i></a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#"><i className="gicon gi-linkedin"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileManuSidebar;
