import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import StandardCreateEventForm from "@/components/events/StandardCreateEventForm";

export const metadata = {
  title: "Créer mon événement | NOLVA",
};

export default function CreerEvenementPage() {
  return (
    <>
      <Breadcrumb title="Créer mon événement" />
      <StandardCreateEventForm />
    </>
  );
}
