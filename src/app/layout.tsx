import "./globals.css";

import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "NOLVA - L'outil des pros de l'événementiel au Bénin",
  description: "Trouvez les meilleurs prestataires événementiels au Bénin : DJs, photographes, hôtesses, animateurs, sécurité et plus encore.",
  keywords: "prestataires événementiels, Bénin, DJ, photographe, hôtesse, Cotonou, événement",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body style={{ background: "none" }}>
        <Loader>
          <Providers>
            <div>{children}</div>
          </Providers>
        </Loader>
      </body>
    </html>
  );
}
