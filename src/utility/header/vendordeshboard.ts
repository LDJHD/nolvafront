interface vendor {
  name: string;
  href: string;
  slug: string;
}

const vendordeshboard: vendor[] = [
  {
    name: "Mon Tableau de bord",
    href: "/vendor-dashboard",
    slug: "vendor-dashboard"
  },
  {
    name: "Mon Profil",
    href: "/vendor-profile",
    slug: "vendor-profile"
  },
  {
    name: "Mes Demandes de devis",
    href: "/vendor-upload",
    slug: "vendor-upload"
  },
  {
    name: "Mes Reservations",
    href: "/vendor-setting",
    slug: "vendor-setting"
  },
  {
    name: "Annuaire Prestataires",
    href: "/prestataires",
    slug: "vendor-list-2"
  },
];

export default vendordeshboard;
