import ProviderQuoteRequestForm from "@/components/quote-request/ProviderQuoteRequestForm";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

export default function Page() {
  return (
    <>
      <Breadcrumb title="Demande de devis" />
      <ProviderQuoteRequestForm />
    </>
  );
}
