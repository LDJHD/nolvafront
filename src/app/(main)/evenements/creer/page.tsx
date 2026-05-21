import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Créer mon événement | NOLVA",
};

export default function CreerEvenementPage() {
  return (
    <>
      <Breadcrumb title="Créer mon événement" />
      <CreateEventForm />
    </>
  );
}
