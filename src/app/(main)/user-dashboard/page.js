import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import UserDashboard from "@/components/user-dashboard/UserDashboard";

export const metadata = {
  title: "Mon Espace | NOLVA",
};

export default function UserDashboardPage() {
  return (
    <>
      <Breadcrumb title="Mon Espace" />
      <UserDashboard />
    </>
  );
}
