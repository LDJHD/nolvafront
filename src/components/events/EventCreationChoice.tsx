"use client";
import Link from "next/link";
import { useState } from "react";
import CreateEventForm from "./CreateEventForm";
import PublishEventWizard from "./PublishEventWizard";

const EventCreationChoice = () => {
  const [choice, setChoice] = useState<"ia" | "classic" | null>(null);

  if (choice === "classic") return <PublishEventWizard />;
  if (choice === "ia") return <CreateEventForm />;

  return (
    <section className="padding-tb-40">
      <div className="container" style={{ maxWidth: "880px" }}>
        <h3 className="text-center mb-4">Comment souhaitez-vous commencer ?</h3>
        <div className="row g-4 justify-content-center">
          <div className="col-md-6">
            <button
              type="button"
              className="nolva-choice-card ia"
              onClick={() => setChoice("ia")}
            >
              <i className="fi fi-rr-magic-wand"></i>
              <h5>CRÉER AVEC NOLVA IA</h5>
              <p>J&apos;ai une idée et je souhaite être accompagné pour construire mon événement avec NOLVA IA.</p>
              <span className="nolva-badge-ia">nolva ia</span>
            </button>
          </div>
          <div className="col-md-6">
            <button
              type="button"
              className="nolva-choice-card classic"
              onClick={() => setChoice("classic")}
            >
              <i className="fi fi-rr-calendar"></i>
              <h5>PUBLIER UN ÉVÉNEMENT DÉJÀ PRÊT</h5>
              <p>Mon événement existe déjà et je souhaite le rendre visible ou vendre mes billets.</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCreationChoice;
