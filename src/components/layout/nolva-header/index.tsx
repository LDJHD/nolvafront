"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout, initFromStorage } from "@/store/reducers/authSlice";
import { authApi } from "@/lib/api";

export default function NolvaHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {/* Barre supérieure */}
      <div style={{ background: "#1A1A1A", padding: "8px 0" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
            🇧🇯 Bénin · Cotonou · Porto-Novo · Calavi
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            {!isAuthenticated ? (
              <>
                <Link href="/login" style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", textDecoration: "none" }}>
                  Connexion
                </Link>
                <Link href="/register" style={{ color: "#E31E24", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>
                  Inscription
                </Link>
              </>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                Bonjour, {user?.firstName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div style={{ background: "#fff", borderBottom: "2px solid #E31E24", padding: "12px 0" }}>
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Image
              src="/assets/img/logo/nolva-logo.png"
              alt="NOLVA"
              width={120}
              height={45}
              style={{ objectFit: "contain" }}
              onError={(e: any) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{ display: "none", fontWeight: 800, fontSize: "24px", color: "#1A1A1A" }}>
              NOL<span style={{ color: "#E31E24" }}>VA</span>
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="d-none d-lg-flex" style={{ gap: "32px", alignItems: "center" }}>
            <Link href="/prestataires" style={{ color: "#1A1A1A", textDecoration: "none", fontWeight: 500, fontSize: "15px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#E31E24")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1A1A1A")}>
              Trouver un prestataire
            </Link>
            <Link href="/evenements" style={{ color: "#1A1A1A", textDecoration: "none", fontWeight: 500, fontSize: "15px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#E31E24")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1A1A1A")}>
              Événements
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin" style={{ color: "#E31E24", textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>
                Administration
              </Link>
            )}
            {isAuthenticated && user?.role === "provider" && (
              <Link href="/vendor-dashboard" style={{ color: "#1A1A1A", textDecoration: "none", fontWeight: 500, fontSize: "15px" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E31E24")}
                onMouseLeave={e => (e.currentTarget.style.color = "#1A1A1A")}>
                Mon espace
              </Link>
            )}
          </nav>

          {/* Boutons droite */}
          <div className="d-flex align-items-center" style={{ gap: "12px" }}>
            {!isAuthenticated ? (
              <Link href="/inscription?role=provider"
                style={{
                  background: "transparent", color: "#E31E24", border: "2px solid #E31E24",
                  borderRadius: "8px", padding: "8px 18px", fontWeight: 600, fontSize: "14px",
                  textDecoration: "none", display: "none"
                }}
                className="d-none d-md-block">
                Je suis prestataire
              </Link>
            ) : (
              <div className="dropdown">
                <button
                  style={{
                    background: "#E31E24", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "8px 18px", fontWeight: 600, fontSize: "14px", cursor: "pointer"
                  }}
                  data-bs-toggle="dropdown">
                  {user?.firstName} ▾
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user?.role === "admin" ? (
                    <>
                      <li><Link className="dropdown-item" href="/admin">Tableau de bord admin</Link></li>
                    </>
                  ) : user?.role === "provider" ? (
                    <>
                      <li><Link className="dropdown-item" href="/vendor-dashboard">Mon tableau de bord</Link></li>
                      <li><Link className="dropdown-item" href="/vendor-profile">Mon profil</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link className="dropdown-item" href="/user-dashboard">Mon compte</Link></li>
                      <li><Link className="dropdown-item" href="/user-dashboard">Mes réservations</Link></li>
                      <li><Link className="dropdown-item" href="/user-dashboard">Mes billets</Link></li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Burger mobile */}
            <button
              className="d-lg-none"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>
              ☰
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid #eee", padding: "12px 0", background: "#fff" }}>
            <div className="container d-flex flex-column" style={{ gap: "8px" }}>
              <Link href="/prestataires" style={{ color: "#1A1A1A", textDecoration: "none", padding: "8px 0", fontWeight: 500 }} onClick={() => setMenuOpen(false)}>
                Trouver un prestataire
              </Link>
              <Link href="/evenements" style={{ color: "#1A1A1A", textDecoration: "none", padding: "8px 0", fontWeight: 500 }} onClick={() => setMenuOpen(false)}>
                Événements
              </Link>
              {!isAuthenticated && (
                <>
                  <Link href="/connexion" style={{ color: "#1A1A1A", textDecoration: "none", padding: "8px 0" }} onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link href="/inscription" style={{ color: "#E31E24", textDecoration: "none", padding: "8px 0", fontWeight: 600 }} onClick={() => setMenuOpen(false)}>Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
