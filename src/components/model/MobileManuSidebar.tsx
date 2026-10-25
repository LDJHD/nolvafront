"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Collapse from 'react-bootstrap/Collapse';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { initFromStorage, logout } from "@/store/reducers/authSlice";
import { accountDisplayName } from "@/lib/accountDisplay";

const MobileManuSidebar = ({ isMobileMenuOpen, closeMobileManu, toggleMainMenu, activeMainMenu }) => {
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
                    <i className="fi fi-rr-home nolva-menu-icon" aria-hidden="true"></i>
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/evenements" onClick={closeMobileManu}>
                    <i className="fi fi-rr-calendar nolva-menu-icon" aria-hidden="true"></i>
                    Événements
                  </Link>
                </li>
                <li>
                  <Link href="/prestataires" onClick={closeMobileManu}>
                    <i className="fi fi-rr-briefcase nolva-menu-icon" aria-hidden="true"></i>
                    Prestataires
                  </Link>
                </li>
                <li>
                  <Link href="/lieux" onClick={closeMobileManu}>
                    <i className="fi fi-rr-marker nolva-menu-icon" aria-hidden="true"></i>
                    Lieux
                  </Link>
                </li>
                <li>
                  <span onClick={() => toggleMainMenu('compte')} className="menu-toggle"></span>
                  <Link href={accountHref} onClick={closeMobileManu}>
                    <i className="fi fi-rr-user nolva-menu-icon" aria-hidden="true"></i>
                    Mon compte
                  </Link>
                  <Collapse in={activeMainMenu === "compte"}>
                    <ul style={{ display: activeMainMenu === "compte" ? "block" : "none" }} className="sub-menu height-transition-1s-ease">
                      {isAuthenticated ? (
                        <>
                          <li>
                            <Link href={accountHref} onClick={closeMobileManu}>
                              {user?.role === "provider" ? "Tableau de bord" : user?.role === "admin" ? "Administration" : "Mon profil"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/user-profile" onClick={closeMobileManu}>Mon profil</Link>
                          </li>
                          <li>
                            <Link href="/user-dashboard" onClick={closeMobileManu}>Mes réservations</Link>
                          </li>
                          <li>
                            <Link href="/user-dashboard" onClick={closeMobileManu}>Mes billets</Link>
                          </li>
                          <li>
                            <Link href="/notifications" onClick={closeMobileManu}>Notifications</Link>
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
              {isAuthenticated && (
                <p className="nolva-mobile-signed-in">
                  Connecté en tant que <strong>{displayName}</strong>
                </p>
              )}
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
