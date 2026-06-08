import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import StandardCreateEventForm from "@/components/events/StandardCreateEventForm";

export const metadata = {
  title: "Publier mon evenement | NOLVA",
};

export default function CreerEvenementPage() {
  return (
    <>
      <Breadcrumb title="Publier mon evenement" />
      <StandardCreateEventForm />
    </>
  );
}
