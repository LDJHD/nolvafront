"use client";
import { useState } from "react";

const HelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="nolva-help-btn">
      <button
        type="button"
        className="nolva-help-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Besoin d'aide ?"
      >
        <i className="fi fi-rr-interrogation" aria-hidden="true"></i>
      </button>
      {open && (
        <div className="nolva-help-panel">
          <p>Besoin d&apos;aide ?</p>
          <a href="https://wa.me/2290195676714" target="_blank" rel="noopener noreferrer" className="nolva-help-whatsapp">
            <i className="fi fi-brands-whatsapp"></i> WhatsApp NOLVA
          </a>
          <button type="button" className="nolva-help-close" onClick={() => setOpen(false)}>×</button>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
