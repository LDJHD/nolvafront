"use client";
import { useState } from "react";
import Link from "next/link";

const BottomNavMobile = () => {
  const [createOpen, setCreateOpen] = useState(false);

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
          <button
            type="button"
            className="nolva-bottom-nav-create"
            onClick={() => setCreateOpen((open) => !open)}
            aria-expanded={createOpen}
            aria-label="Créer"
          >
            <i className="fi fi-rr-plus" aria-hidden="true"></i>
            <span>Créer</span>
          </button>
          {createOpen && (
            <>
              <div className="nolva-create-backdrop" onClick={() => setCreateOpen(false)} />
              <div className="nolva-create-menu" role="menu">
                <Link
                  href="/evenements/publier"
                  role="menuitem"
                  className="nolva-create-menu-item"
                  onClick={() => setCreateOpen(false)}
                >
                  <span className="nolva-create-menu-icon">
                    <i className="fi fi-rr-rocket" aria-hidden="true"></i>
                  </span>
                  <span className="nolva-create-menu-text">
                    <strong>Créer un événement</strong>
                    <small>Assistant NOLVA ou formulaire classique</small>
                  </span>
                </Link>
                <Link
                  href="/evenements/creer"
                  role="menuitem"
                  className="nolva-create-menu-item"
                  onClick={() => setCreateOpen(false)}
                >
                  <span className="nolva-create-menu-icon">
                    <i className="fi fi-rr-plus-small" aria-hidden="true"></i>
                  </span>
                  <span className="nolva-create-menu-text">
                    <strong>Publier</strong>
                    <small>Formulaire de publication</small>
                  </span>
                </Link>
              </div>
            </>
          )}
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
