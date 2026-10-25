interface Pages {
  name: string;
  href: string;
}

const pages: Pages[] = [
  { name: "À propos de NOLVA", href: "/about-us" },
  { name: "Comment ça marche", href: "/politique-nolva" },
  { name: "Devenir prestataire", href: "/register?role=provider" },
  { name: "Contact", href: "/contact-us" },
  { name: "FAQ", href: "/faq" },
  { name: "Confidentialité", href: "/confidentialite" },
  { name: "Conditions d'utilisation", href: "/terms-condition" },
];

export default pages;
