import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import PublishEventWizard from "@/components/events/PublishEventWizard";

export const metadata = {
  title: "Publier un événement | NOLVA",
};

export default function PublierEvenementPage() {
  return (
    <>
      <Breadcrumb title="Publier un événement" />
      <PublishEventWizard />
    </>
  );
}
