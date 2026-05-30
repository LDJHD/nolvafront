"use client";

import Link from "next/link";

const WelcomeMessage = ({ firstName }: { firstName?: string }) => {
  return (
    <div className="nolva-welcome-message">
      <div className="nolva-welcome-icon">
        <i className="fi fi-rr-party-horn"></i>
      </div>
      <h4>Bonjour {firstName || ""}</h4>
      <p>
        Bienvenue sur NOLVA, votre nouvelle plateforme dédiée à l’univers de
        l’événementiel au Bénin. Que vous prépariez un mariage, un anniversaire,
        une conférence, un concert ou un simple moment spécial, NOLVA vous aide
        à trouver les bons prestataires, découvrir des événements et organiser
        vos projets plus facilement grâce à une assistance intelligente.
      </p>
      <ul>
        <li>Trouver des prestataires vérifiés</li>
        <li>Explorer des événements à venir</li>
        <li>Organiser votre événement étape par étape</li>
        <li>Recevoir des suggestions intelligentes adaptées à vos besoins</li>
        <li>Gagner du temps et éviter les erreurs de débutant</li>
      </ul>
      <p>
        Chaque grand événement commence par une idée. Et nous sommes heureux de
        vous accompagner dans cette aventure.
      </p>
      <Link href="/home" className="gi-btn-1">
        Explorer NOLVA
      </Link>
      <small>À très bientôt sur NOLVA</small>
    </div>
  );
};

export default WelcomeMessage;
