import { Suspense } from "react";
import ResetPasswordPage from "@/components/login/ResetPasswordPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Chargement...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
