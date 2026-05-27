"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Collapse from 'react-bootstrap/Collapse';
import { useDispatch, useSelector } from "react-redux";
import { useProviderTypes } from "@/lib/useCatalog";
import { RootState } from "@/store";
import { initFromStorage, logout } from "@/store/reducers/authSlice";

const MobileManuSidebar = ({ isMobileMenuOpen, closeMobileManu, toggleMainMenu, activeMainMenu }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { types: providerTypes } = useProviderTypes();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    closeMobileManu();
    router.push("/");
  };

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
                  <Link href="/prestataires" onClick={closeMobileManu}>
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
                  <span onClick={() => toggleMainMenu('evenements')} className="menu-toggle"></span>
                  <Link href="/evenements" onClick={closeMobileManu}>
                    Événements
                  </Link>
                  <Collapse in={activeMainMenu === "evenements"}>
                    <ul style={{ display: activeMainMenu === "evenements" ? "block" : "none" }} className="sub-menu height-transition-1s-ease">
                      <li>
                        <Link href="/evenements" onClick={closeMobileManu}>Tous les événements</Link>
                      </li>
                      <li>
                        <Link href="/evenements/publier" onClick={closeMobileManu}>Publier un événement</Link>
                      </li>
                      <li>
                        <Link href="/evenements/creer" onClick={closeMobileManu}>Créer (validation admin)</Link>
                      </li>
                    </ul>
                  </Collapse>
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
                  <span onClick={() => toggleMainMenu('connexion')} className="menu-toggle"></span>
                  <Link
                    href={isAuthenticated ? "/user-profile" : "/login"}
                    onClick={closeMobileManu}
                  >
                    {isAuthenticated ? user?.firstName || "Mon compte" : "Connexion"}
                  </Link>
                  <Collapse in={activeMainMenu === "connexion"}>
                    <ul style={{ display: activeMainMenu === "connexion" ? "block" : "none" }} className="sub-menu height-transition-1s-ease">
                      {isAuthenticated ? (
                        <>
                          {user?.role === "provider" && (
                            <li>
                              <Link href="/vendor-dashboard" onClick={closeMobileManu}>Tableau de bord</Link>
                            </li>
                          )}
                          <li>
                            <Link href="/user-profile" onClick={closeMobileManu}>Mon profil</Link>
                          </li>
                          <li>
                            <Link href="/user-dashboard" onClick={closeMobileManu}>Mes réservations</Link>
                          </li>
                          <li>
                            <button type="button" className="nolva-mobile-menu-action" onClick={handleLogout}>
                              Déconnexion
                            </button>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link href="/login" onClick={closeMobileManu}>Se connecter</Link>
                          </li>
                          <li>
                            <Link href="/register" onClick={closeMobileManu}>Créer un compte</Link>
                          </li>
                          <li>
                            <Link href="/mot-de-passe/oublie" onClick={closeMobileManu}>Mot de passe oublié</Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </Collapse>
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
