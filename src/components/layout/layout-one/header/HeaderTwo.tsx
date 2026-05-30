"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout, initFromStorage } from "@/store/reducers/authSlice";
import NotificationBell from "@/components/notifications/NotificationBell";

function HeaderTwo() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchInput.trim();
    if (q) {
      router.push(`/prestataires?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/prestataires");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div className="gi-header-bottom d-lg-block">
      <div className="container position-relative">
        <div className="row">
          <div className="gi-flex nolva-header-row">
            <div className="align-self-center gi-header-logo">
              <div className="header-logo">
                <Link href="/">
                  <img
                    src={
                      "/assets/img/logo/nolva-logo.png"
                    }
                    alt="NOLVA"
                  />
                </Link>
              </div>
            </div>

            <div className="nolva-header-spacer" aria-hidden="true" />

            <div className="nolva-header-search-slot align-self-center">
              <form
                onSubmit={handleSubmit}
                className="nolva-header-search-form"
                role="search"
                aria-label="Rechercher sur NOLVA"
              >
                <i className="fi-rr-search nolva-header-search-icon" aria-hidden="true" />
                <input
                  className="nolva-header-search-input"
                  placeholder="Prestataire, ville, spécialité…"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  name="q"
                  autoComplete="off"
                />
                <button className="nolva-header-search-btn" type="submit" title="Rechercher">
                  <i className="fi-rr-search" aria-hidden="true" />
                </button>
              </form>
            </div>

            <div className="gi-header-action align-self-center">
              <div className="gi-header-bottons">
                <NotificationBell />
                <div className="gi-acc-drop">
                  <Link
                    href=""
                    className="gi-header-btn gi-header-user dropdown-toggle gi-user-toggle gi-header-rtl-btn"
                    title="Compte"
                  >
                    <div className="header-icon">
                      <i className="fi-rr-user"></i>
                    </div>
                    <div className="gi-btn-desc">
                      <span className="gi-btn-title">Compte</span>
                      <span className="gi-btn-stitle">
                        {isAuthenticated ? user?.firstName || "Mon compte" : "Connexion"}
                      </span>
                    </div>
                  </Link>
                  <ul className="gi-dropdown-menu">
                    {isAuthenticated ? (
                      <>
                        {user?.role === "provider" && (
                          <li>
                            <Link className="dropdown-item" href="/vendor-dashboard">
                              Tableau de bord
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link className="dropdown-item" href="/user-profile">
                            Mon Profil
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/user-dashboard">
                            Mes Réservations
                          </Link>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={handleLogout}
                            style={{ cursor: "pointer" }}
                          >
                            Déconnexion
                          </a>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link className="dropdown-item" href="/login">
                            Connexion
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/register">
                            Inscription
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <Link
                  href="/demande-devis"
                  className="gi-header-btn gi-header-rtl-btn"
                  title="Demande de devis"
                >
                  <div className="header-icon">
                    <i className="fi-rr-document"></i>
                  </div>
                  <div className="gi-btn-desc">
                    <span className="gi-btn-title">Devis</span>
                    <span className="gi-btn-stitle">Demander</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderTwo;
