"use client";

import LayoutOne from "@/components/layout/layout-one";
import HelpButton from "@/components/help/HelpButton";
import PushNotificationManager from "@/components/pwa/PushNotificationManager";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LayoutOne>{children}</LayoutOne>
      <HelpButton />
      <PushNotificationManager />
    </>
  );
}
