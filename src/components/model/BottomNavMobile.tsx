"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const BottomNavMobile = () => {
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
    <nav className="nolva-bottom-nav">
      <ul className="nolva-bottom-nav-list">
        <li className="nolva-bottom-nav-item">
          <Link href="/" className="nolva-bottom-nav-link">
            <i className="fi fi-rr-home" aria-hidden="true"></i>
            <span>Accueil</span>
          </Link>
        </li>
        <li className="nolva-bottom-nav-item">
          <Link href="/evenements" className="nolva-bottom-nav-link">
            <i className="fi fi-rr-calendar" aria-hidden="true"></i>
            <span>Événements</span>
          </Link>
        </li>
        <li className="nolva-bottom-nav-item nolva-bottom-nav-center">
          <Link href="/evenements/publier" className="nolva-bottom-nav-create">
            <i className="fi fi-rr-plus" aria-hidden="true"></i>
            <span>Créer</span>
          </Link>
        </li>
        <li className="nolva-bottom-nav-item">
          <Link href="/prestataires" className="nolva-bottom-nav-link">
            <i className="fi fi-rr-briefcase" aria-hidden="true"></i>
            <span>Prestataires</span>
          </Link>
        </li>
        <li className="nolva-bottom-nav-item">
          <Link href={accountHref} className="nolva-bottom-nav-link">
            <i className={isAuthenticated ? "fi fi-rr-user" : "fi fi-rr-user"} aria-hidden="true"></i>
            <span>{isAuthenticated ? "Mon compte" : "Connexion"}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavMobile;
