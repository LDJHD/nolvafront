interface Home {
  name: string;
  href: string;
}

const home: Home[] = [
  { name: "Accueil", href: "/home" },
  { name: "Prestataires", href: "/prestataires" },
  { name: "Événements", href: "/evenements" },
];

export default home;
