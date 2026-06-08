import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Creer mon evenement | NOLVA",
};

export default function PublierEvenementPage() {
  return (
    <>
      <Breadcrumb title="Creer mon evenement" />
      <CreateEventForm />
    </>
  );
}
