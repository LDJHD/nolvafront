"use client";

import { useEffect } from "react";

const PwaRegister = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // L'application reste utilisable si le navigateur refuse le service worker.
      });
    }
  }, []);

  return null;
};

export default PwaRegister;
