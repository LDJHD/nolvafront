import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import EventCreationChoice from "@/components/events/EventCreationChoice";

export const metadata = {
  title: "Creer mon evenement | NOLVA",
};

export default function PublierEvenementPage() {
  return (
    <>
      <Breadcrumb title="Creer mon evenement" />
      <EventCreationChoice />
    </>
  );
}
