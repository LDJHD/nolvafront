"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout, initFromStorage } from "@/store/reducers/authSlice";

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

  const handleSearch = (event: any) => {
    setSearchInput(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchInput.trim()) {
      router.push(`/prestataires?search=${encodeURIComponent(searchInput)}`);
    } else {
      router.push("/prestataires");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <>
      <div className="gi-header-bottom d-lg-block">
        <div className="container position-relative">
          <div className="row">
            <div className="gi-flex">
              {/* Logo */}
              <div className="align-self-center gi-header-logo">
                <div className="header-logo">
                  <Link href="/">
                    <img
                      src={
                        process.env.NEXT_PUBLIC_URL +
                        "/assets/img/logo/nolva-logo.png"
                      }
                      alt="NOLVA"
                    />
                  </Link>
                </div>
              </div>
              {/* Search */}
              <div className="align-self-center gi-header-search">
                <div className="header-search">
                  <form
                    onSubmit={handleSubmit}
                    className="gi-search-group-form"
                    action="#"
                  >
                    <input
                      className="form-control gi-search-bar"
                      placeholder="Rechercher un prestataire, un événement..."
                      type="text"
                      value={searchInput}
                      onChange={handleSearch}
                    />
                    <button className="search_submit" type="submit">
                      <i className="fi-rr-search"></i>
                    </button>
                  </form>
                </div>
              </div>
              {/* Actions */}
              <div className="gi-header-action align-self-center">
                <div className="gi-header-bottons">
                  {/* Account dropdown */}
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
                          {" "}
                          {isAuthenticated ? (user?.firstName || "Mon compte") : "Connexion"}
                        </span>
                      </div>
                    </Link>
                    <ul className="gi-dropdown-menu">
                      {isAuthenticated ? (
                        <>
                          {user?.role === "provider" && (
                            <li>
                              <Link
                                className="dropdown-item"
                                href="/vendor-dashboard"
                              >
                                Tableau de bord
                              </Link>
                            </li>
                          )}
                          <li>
                            <Link
                              className="dropdown-item"
                              href="/user-profile"
                            >
                              Mon Profil
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" href="/user-dashboard">
                              Mes Réservations
                            </Link>
                          </li>
                          <li>
                            <a className="dropdown-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
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
                  {/* Demande de devis button */}
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
    </>
  );
}

export default HeaderTwo;
