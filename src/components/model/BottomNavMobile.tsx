"use client";
import Link from "next/link";

const BottomNavMobile = () => {
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
          <Link href="/lieux" className="nolva-bottom-nav-link">
            <i className="fi fi-rr-marker" aria-hidden="true"></i>
            <span>Lieux</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavMobile;
