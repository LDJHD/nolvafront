interface Pages {
  name: string;
  href: string;
}

const pages: Pages[] = [
  { name: "À propos de NOLVA", href: "/a-propos" },
  { name: "Comment ça marche", href: "/comment-ca-marche" },
  { name: "Devenir prestataire", href: "/inscription?role=provider" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Confidentialité", href: "/confidentialite" },
  { name: "Conditions d'utilisation", href: "/conditions" },
];

export default pages;
