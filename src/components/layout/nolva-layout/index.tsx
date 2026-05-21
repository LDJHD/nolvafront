"use client";
import NolvaHeader from "@/components/layout/nolva-header";
import NolvaFooter from "@/components/layout/nolva-footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NolvaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NolvaHeader />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <NolvaFooter />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
