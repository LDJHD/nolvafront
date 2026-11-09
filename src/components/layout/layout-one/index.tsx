"use client";
import Footer from "./Footer";
import Header from "./Header";
import Toastify from "../../toast-popup/Toastify";
import { useEffect } from "react";

function LayoutOne({ children }) {
  useEffect(() => {
    const cssFilePath = "/assets/css/demo-1.css";
    const link = document.createElement("link");
    link.href = cssFilePath;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load NOLVA custom CSS
    const nolvaCss = document.createElement("link");
    nolvaCss.href = "/assets/css/nolva.css";
    nolvaCss.rel = "stylesheet";
    document.head.appendChild(nolvaCss);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(nolvaCss);
    };
  }, []);

  return (
    <>
      <Header />
      {children}
      <Footer />
      <Toastify />
    </>
  );
}

export default LayoutOne;
