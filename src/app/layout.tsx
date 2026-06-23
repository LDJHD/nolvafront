import "./globals.css";

import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";
import PwaRegister from "@/components/pwa/PwaRegister";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "NOLVA - L'outil des pros de l'evenementiel au Benin",
  description: "Trouvez les meilleurs prestataires evenementiels au Benin : DJs, photographes, hotesses, animateurs, securite et plus encore.",
  keywords: "prestataires evenementiels, Benin, DJ, photographe, hotesse, Cotonou, evenement",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NOLVA",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/img/logo/icone.png",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body style={{ background: "none" }}>
        <Loader>
          <Providers>
            <PwaRegister />
            <div>{children}</div>
          </Providers>
        </Loader>
      </body>
    </html>
  );
}
