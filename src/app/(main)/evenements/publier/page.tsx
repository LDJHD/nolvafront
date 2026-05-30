import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Publier un événement | NOLVA",
};

export default function PublierEvenementPage() {
  return (
    <>
      <Breadcrumb title="Publier un événement" />
      <CreateEventForm />
    </>
  );
}
