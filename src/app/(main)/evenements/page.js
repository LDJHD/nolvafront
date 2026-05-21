import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import EventsList from "@/components/events/EventsList";

export const metadata = {
  title: "Événements | NOLVA",
};

export default function EvenementsPage() {
  return (
    <>
      <Breadcrumb title="Événements" />
      <EventsList />
    </>
  );
}
