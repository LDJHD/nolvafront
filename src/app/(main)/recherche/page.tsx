import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import GlobalSearchResults from "@/components/search/GlobalSearchResults";

export const metadata = {
  title: "Recherche | NOLVA",
};

export default function RecherchePage() {
  return (
    <>
      <Breadcrumb title="Recherche" />
      <GlobalSearchResults />
    </>
  );
}
