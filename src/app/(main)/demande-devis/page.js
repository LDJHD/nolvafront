import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import QuoteRequestForm from "@/components/quote-request/QuoteRequestForm";

export const metadata = {
  title: "Demande de devis | NOLVA",
};

export default function DemandeDevisPage() {
  return (
    <>
      <Breadcrumb title="Demande de devis" />
      <QuoteRequestForm />
    </>
  );
}
