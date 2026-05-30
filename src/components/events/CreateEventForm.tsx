"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Col, Form, Row } from "react-bootstrap";
import jsPDF from "jspdf";
import { eventsApi, providersApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { emptyTicketRow, type TicketDraft } from "@/lib/eventPublishGuide";
import { useEventTypes } from "@/lib/useCatalog";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const eventTypes = [
  "Mariage",
  "Anniversaire",
  "Concert",
  "Conférence",
  "Soirée privée",
  "Baptême",
  "Fête d'entreprise",
  "Lancement de produit",
  "Festival",
  "Autre",
];

const beninCities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Ouidah"];

const moods = [
  "Élégant et chic",
  "Moderne et dynamique",
  "Familial et chaleureux",
  "Festif et énergique",
  "Luxe et exclusif",
  "Professionnel et sérieux",
  "Culturel et authentique",
];

const needs = [
  "DJ",
  "Photographe",
  "Vidéaste",
  "Décoration",
  "Salle",
  "Traiteur",
  "Sonorisation",
  "Éclairage",
  "Sécurité",
  "Hôtesses",
  "Impression",
  "Animation",
  "Transport",
  "Coordination événementielle",
];

const budgetLevels = ["Essentiel", "Standard", "Premium", "Luxe"];

const eventTypeSlug: Record<string, string> = {
  Mariage: "mariage",
  Anniversaire: "anniversaire",
  Concert: "concert",
  Conférence: "conference",
  "Soirée privée": "soiree_privee",
  Baptême: "bapteme",
  "Fête d'entreprise": "team_building",
  "Lancement de produit": "lancement_produit",
  Festival: "festival",
};

const needToProviderType: Record<string, string> = {
  DJ: "dj",
  Photographe: "photographe",
  Décoration: "decorateur",
  Salle: "salle",
  Traiteur: "traiteur",
  Sonorisation: "location_materiel",
  Sécurité: "securite",
  Hôtesses: "hotesse",
  Animation: "animateur",
  "Coordination événementielle": "organisateur",
};

const formatEventDateForApi = (local: string): string => {
  if (!local) return local;
  if (local.includes("T")) {
    const [date, time] = local.split("T");
    const t = time.length === 5 ? `${time}:00` : time;
    return `${date} ${t}`;
  }
  return local;
};

const CreateEventForm = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: catalogEventTypes, loading: typesLoading } = useEventTypes();
  const [step, setStep] = useState(0);
  const [providers, setProviders] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [draftEvent, setDraftEvent] = useState({
    event_type: "",
    title: "",
    description: "",
    event_date: "",
    location: "",
    city: "",
    image: "",
    is_free: true,
  });
  const [draftTickets, setDraftTickets] = useState<TicketDraft[]>([
    { label: "Standard", price: "5000", quantity: "100" },
  ]);
  const [form, setForm] = useState({
    eventType: "",
    otherType: "",
    mood: "",
    customMood: "",
    city: "",
    date: "",
    guests: "",
    duration: "",
    hasVenue: "",
    budgetLevel: "Standard",
    budget: "",
    needs: [] as string[],
  });

  const eventTypeChoices = useMemo(
    () =>
      Array.from(
        new Set([
          ...(catalogEventTypes.length
            ? catalogEventTypes.map((type) => type.label)
            : eventTypes.filter((type) => type !== "Autre")),
          "Autre",
        ])
      ),
    [catalogEventTypes]
  );
  const selectedType = form.eventType === "Autre" ? form.otherType || "événement" : form.eventType || "événement";
  const selectedMood = form.customMood || form.mood || "ambiance adaptée";
  const selectedCatalogType = catalogEventTypes.find((type) => type.label === form.eventType);

  const suggestedNeeds = useMemo(() => {
    if (form.needs.length > 0) return form.needs;
    if (selectedType.toLowerCase().includes("mariage")) return ["Salle", "Décoration", "Photographe", "DJ", "Traiteur"];
    if (selectedType.toLowerCase().includes("conférence")) return ["Salle", "Sonorisation", "Hôtesses", "Impression"];
    if (selectedType.toLowerCase().includes("concert")) return ["Sonorisation", "Éclairage", "Sécurité", "Photographe"];
    return ["Salle", "Animation", "Photographe", "Coordination événementielle"];
  }, [form.needs, selectedType]);

  const score = useMemo(() => {
    const fields = [selectedType, selectedMood, form.city, form.date, form.guests, form.duration, form.hasVenue, form.budgetLevel];
    const completed = fields.filter(Boolean).length + Math.min(suggestedNeeds.length, 4);
    return Math.min(100, Math.round((completed / 12) * 100));
  }, [form, selectedMood, selectedType, suggestedNeeds]);

  const summary = `Vous préparez un ${selectedType.toLowerCase()} ${selectedMood.toLowerCase()} pour environ ${form.guests || "plusieurs"} invités à ${form.city || "votre ville"}.`;
  const completedItems = [
    selectedType && "Type d'événement",
    selectedMood && "Ambiance",
    form.city && "Ville",
    form.date && "Date estimée",
    form.guests && "Nombre d'invités",
    form.duration && "Durée",
    form.hasVenue && "Lieu",
    form.budgetLevel && "Niveau de budget",
  ].filter(Boolean) as string[];
  const missingItems = [
    !form.city && "Ville",
    !form.date && "Date estimée",
    !form.guests && "Nombre d'invités",
    !form.duration && "Durée",
    !form.hasVenue && "Lieu déjà trouvé",
  ].filter(Boolean) as string[];
  const tips = [
    form.hasVenue === "Non" ? "Prévoir rapidement une salle adaptée au nombre d'invités." : "Confirmer l'accès technique du lieu.",
    "Prévoir un plan pluie ou une solution de repli.",
    "Identifier une personne responsable de la coordination le jour J.",
    suggestedNeeds.includes("Sécurité") ? "Valider le dispositif de sécurité avec le prestataire." : "Évaluer si une présence sécurité est nécessaire.",
  ];
  const checklist = [
    "Réserver le lieu",
    "Confirmer les prestataires clés",
    "Préparer les invitations",
    "Valider la décoration",
    "Tester la sonorisation",
    "Confirmer les invités",
  ];
  const planning = [
    ["J-30", "Réserver salle et prestataires principaux"],
    ["J-15", "Confirmer invités et besoins techniques"],
    ["J-7", "Finaliser décoration, programme et paiements"],
    ["Jour J", "Coordination générale et accueil des invités"],
  ];

  const toggleNeed = (need: string) => {
    setForm((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((item) => item !== need)
        : [...prev.needs, need],
    }));
  };

  const loadProviders = async () => {
    const primaryNeed = suggestedNeeds.find((need) => needToProviderType[need]);
    try {
      const res = await providersApi.list({
        type: primaryNeed ? needToProviderType[primaryNeed] : undefined,
        city: form.city || undefined,
        limit: 4,
      });
      setProviders(normalizeList(res.data).slice(0, 4));
    } catch {
      setProviders([]);
    }
  };

  const analyze = async () => {
    await loadProviders();
    const defaultTicketQuantity = form.guests || "100";
    setDraftEvent({
      event_type: selectedCatalogType?.slug || eventTypeSlug[form.eventType] || "autre",
      title: `${selectedType} - ${form.city || "Ville a confirmer"}`,
      description: [
        summary,
        "",
        `Ambiance souhaitee : ${selectedMood}`,
        `Nombre d'invites : ${form.guests || "A confirmer"}`,
        `Duree prevue : ${form.duration || "A confirmer"}`,
        `Niveau de budget : ${form.budgetLevel}`,
        form.budget ? `Budget approximatif : ${form.budget}` : "",
        `Besoins : ${suggestedNeeds.join(", ")}`,
        "",
        "Suggestions NOLVA :",
        ...tips.map((item) => `- ${item}`),
        "",
        "Checklist NOLVA :",
        ...checklist.map((item) => `- ${item}`),
      ]
        .filter(Boolean)
        .join("\n"),
      event_date: form.date,
      location: form.hasVenue === "Oui" ? "Lieu a confirmer" : "Salle a definir",
      city: form.city,
      image: "",
      is_free: true,
    });
    setDraftTickets([{ label: "Standard", price: "5000", quantity: defaultTicketQuantity }]);
    setStep(6);
  };

  const handleDraftImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showErrorToast("Image trop volumineuse (max 3 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1200;
        let w = img.width;
        let h = img.height;
        if (w > max) {
          h = (h * max) / w;
          w = max;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setDraftEvent((prev) => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateDraftTicket = (index: number, field: keyof TicketDraft, value: string) => {
    setDraftTickets((prev) => prev.map((ticket, i) => (i === index ? { ...ticket, [field]: value } : ticket)));
  };

  const addDraftTicketRow = () => setDraftTickets((prev) => [...prev, emptyTicketRow()]);
  const removeDraftTicketRow = (index: number) =>
    setDraftTickets((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Fiche événement NOLVA", 14, 18);
    doc.setFontSize(11);
    doc.text(summary, 14, 30, { maxWidth: 180 });
    doc.text(`Score de préparation : ${score}%`, 14, 46);
    doc.text("Checklist", 14, 60);
    checklist.forEach((item, index) => doc.text(`- ${item}`, 18, 70 + index * 7));
    doc.text("Planning", 14, 118);
    planning.forEach(([date, action], index) => doc.text(`${date} : ${action}`, 18, 128 + index * 7));
    doc.text("Suggestions importantes", 14, 166);
    tips.forEach((item, index) => doc.text(`- ${item}`, 18, 176 + index * 7, { maxWidth: 175 }));
    if (providers.length > 0) {
      doc.addPage();
      doc.setFontSize(18);
      doc.text("Prestataires recommandes NOLVA", 14, 18);
      doc.setFontSize(11);
      providers.forEach((provider, index) => {
        doc.text(
          `${index + 1}. ${provider.businessName || provider.business_name || "Prestataire"} - ${provider.city || form.city || "Benin"}`,
          14,
          32 + index * 12
        );
      });
    }
    doc.save("fiche-evenement-nolva.pdf");
  };

  const submitForAdminValidation = async () => {
    if (!isAuthenticated) {
      showErrorToast("Connectez-vous ou creez un compte pour soumettre l'evenement a validation.");
      return;
    }
    if (!draftEvent.event_type || !draftEvent.title.trim() || !draftEvent.event_date || !draftEvent.city.trim()) {
      showErrorToast("Completez le titre, la ville et la date avant la soumission.");
      return;
    }

    setSubmitting(true);
    try {
      const ticketTypes = draftEvent.is_free
        ? []
        : draftTickets
            .filter((ticket) => ticket.label.trim())
            .map((ticket) => ({
              label: ticket.label.trim(),
              price: Number(ticket.price) || 0,
              quantity: Number(ticket.quantity) || 0,
            }));

      if (!draftEvent.is_free && ticketTypes.length === 0) {
        showErrorToast("Ajoutez au moins un type de billet");
        return;
      }

      const res = await eventsApi.create({
        title: draftEvent.title.trim(),
        description: draftEvent.description.trim() || undefined,
        event_type: draftEvent.event_type,
        event_date: formatEventDateForApi(draftEvent.event_date),
        city: draftEvent.city,
        location: draftEvent.location.trim() || undefined,
        image: draftEvent.image || undefined,
        ticket_types: ticketTypes,
        ticket_price: draftEvent.is_free ? 0 : undefined,
        ticket_count: draftEvent.is_free ? 0 : undefined,
      });
      showSuccessToast(res.data?.message || "Evenement soumis a validation admin.");
      router.push("/user-dashboard");
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="padding-tb-40 nolva-ai-event">
      <div className="container">
        <div className="section-title-2">
          <h2 className="gi-title">Créez votre événement avec <span>l&apos;assistance intelligente NOLVA</span></h2>
          <p>Décrivez votre projet et laissez NOLVA vous accompagner étape par étape.</p>
        </div>

        <div className="nolva-ai-shell">
          {step === 0 && (
            <div className="nolva-ai-card">
              <h4>Prêt à structurer votre événement ?</h4>
              <p>Vous pouvez commencer sans compte. L&apos;inscription sera proposée au moment de sauvegarder.</p>
              <button className="gi-btn-1" onClick={() => setStep(1)}>Commencer</button>
            </div>
          )}

          {step === 1 && (
            <div className="nolva-ai-card">
              <h4>Quel type d&apos;événement souhaitez-vous organiser ?</h4>
              <div className="nolva-choice-grid">
                {eventTypeChoices.map((type) => (
                  <button key={type} className={form.eventType === type ? "active" : ""} onClick={() => setForm({ ...form, eventType: type })}>{type}</button>
                ))}
              </div>
              {form.eventType === "Autre" && <Form.Control className="mt-3" placeholder="Précisez le type" value={form.otherType} onChange={(e) => setForm({ ...form, otherType: e.target.value })} />}
              <button className="gi-btn-1 mt-3" disabled={!form.eventType || typesLoading} onClick={() => setStep(2)}>Continuer</button>
            </div>
          )}

          {step === 2 && (
            <div className="nolva-ai-card">
              <h4>Quelle expérience souhaitez-vous faire vivre à vos invités ?</h4>
              <div className="nolva-choice-grid">
                {moods.map((mood) => (
                  <button key={mood} className={form.mood === mood ? "active" : ""} onClick={() => setForm({ ...form, mood })}>{mood}</button>
                ))}
              </div>
              <Form.Control className="mt-3" placeholder="Ou décrivez librement l'ambiance" value={form.customMood} onChange={(e) => setForm({ ...form, customMood: e.target.value })} />
              <button className="gi-btn-1 mt-3" onClick={() => setStep(3)}>Continuer</button>
            </div>
          )}

          {step === 3 && (
            <div className="nolva-ai-card">
              <h4>Informations principales</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                    <option value="">Choisir une ville</option>
                    {beninCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-6"><Form.Control type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="col-md-6"><Form.Control type="number" placeholder="Nombre d'invités" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} /></div>
                <div className="col-md-6"><Form.Control placeholder="Durée prévue" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                <div className="col-12">
                  <Form.Select value={form.hasVenue} onChange={(e) => setForm({ ...form, hasVenue: e.target.value })}>
                    <option value="">Lieu déjà trouvé ?</option>
                    <option>Oui</option>
                    <option>Non</option>
                  </Form.Select>
                </div>
              </div>
              <button className="gi-btn-1 mt-3" onClick={() => setStep(4)}>Continuer</button>
            </div>
          )}

          {step === 4 && (
            <div className="nolva-ai-card">
              <h4>Niveau de budget</h4>
              <div className="nolva-choice-grid">
                {budgetLevels.map((level) => (
                  <button key={level} className={form.budgetLevel === level ? "active" : ""} onClick={() => setForm({ ...form, budgetLevel: level })}>{level}</button>
                ))}
              </div>
              <Form.Control className="mt-3" placeholder="Budget approximatif (optionnel)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              <button className="gi-btn-1 mt-3" onClick={() => setStep(5)}>Continuer</button>
            </div>
          )}

          {step === 5 && (
            <div className="nolva-ai-card">
              <h4>De quoi avez-vous besoin ?</h4>
              <div className="nolva-choice-grid">
                {needs.map((need) => (
                  <button key={need} className={form.needs.includes(need) ? "active" : ""} onClick={() => toggleNeed(need)}>{need}</button>
                ))}
              </div>
              <button className="gi-btn-2 mt-3" onClick={() => setForm({ ...form, needs: [] })}>
                Je ne sais pas encore
              </button>
              <button className="gi-btn-1 mt-3" onClick={analyze}>Analyser mon projet</button>
            </div>
          )}

          {step === 6 && (
            <div className="nolva-ai-result">
              <div className="nolva-ai-card">
                <h4>Votre événement est prêt à {score}%</h4>
                <p>{summary}</p>
                <h6>Éléments complétés</h6>
                <ul>{completedItems.map((item) => <li key={item}>{item}</li>)}</ul>
                <h6>Éléments manquants</h6>
                <ul>
                  {(missingItems.length > 0 ? missingItems : ["Votre base est prête."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {!suggestedNeeds.includes("Sécurité") && (
                  <p className="small text-muted">Notification intelligente : vous n&apos;avez pas encore prévu la sécurité.</p>
                )}
                <h6>Suggestions importantes</h6>
                <ul>{tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                <h6>Checklist</h6>
                <ul>{checklist.map((item) => <li key={item}>{item}</li>)}</ul>
                <h6>Planning automatique</h6>
                <ul>{planning.map(([date, action]) => <li key={date}><strong>{date}</strong> - {action}</li>)}</ul>
                <hr />
                <h6>Formulaire evenement pre-rempli</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Type d&apos;evenement *</Form.Label>
                    <Form.Select
                      value={draftEvent.event_type}
                      onChange={(e) => setDraftEvent({ ...draftEvent, event_type: e.target.value })}
                      disabled={typesLoading}
                      required
                    >
                      <option value="">Choisir un type</option>
                      {catalogEventTypes.map((type) => (
                        <option key={type.slug} value={type.slug}>
                          {type.label}
                        </option>
                      ))}
                      {!catalogEventTypes.some((type) => type.slug === "autre") && (
                        <option value="autre">Autre</option>
                      )}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Titre *</Form.Label>
                    <Form.Control
                      value={draftEvent.title}
                      onChange={(e) => setDraftEvent({ ...draftEvent, title: e.target.value })}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={draftEvent.description}
                      onChange={(e) => setDraftEvent({ ...draftEvent, description: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Date et heure *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={draftEvent.event_date}
                      onChange={(e) => setDraftEvent({ ...draftEvent, event_date: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Ville *</Form.Label>
                    <Form.Select
                      value={draftEvent.city}
                      onChange={(e) => setDraftEvent({ ...draftEvent, city: e.target.value })}
                    >
                      <option value="">Choisir</option>
                      {beninCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Lieu</Form.Label>
                    <Form.Control
                      value={draftEvent.location}
                      onChange={(e) => setDraftEvent({ ...draftEvent, location: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Image</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleDraftImage} />
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <h6 className="fw-semibold mb-0">Billets</h6>
                  <Form.Check
                    type="switch"
                    id="ai-free-event"
                    label="Evenement gratuit"
                    checked={draftEvent.is_free}
                    onChange={(e) => setDraftEvent({ ...draftEvent, is_free: e.target.checked })}
                  />
                </div>

                {draftEvent.is_free ? (
                  <div className="alert alert-light border">
                    Les champs de billets sont masques. L&apos;evenement sera soumis comme gratuit.
                  </div>
                ) : (
                  <>
                    {draftTickets.map((ticket, index) => (
                      <Row className="g-2 mb-3 align-items-end" key={index}>
                        <Col md={4}>
                          <Form.Label>Libelle</Form.Label>
                          <Form.Control
                            value={ticket.label}
                            onChange={(e) => updateDraftTicket(index, "label", e.target.value)}
                            placeholder="Standard, VIP..."
                            required={!draftEvent.is_free}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>Prix (FCFA)</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            step={1}
                            value={ticket.price}
                            onChange={(e) => updateDraftTicket(index, "price", e.target.value)}
                            required={!draftEvent.is_free}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>Places</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            value={ticket.quantity}
                            onChange={(e) => updateDraftTicket(index, "quantity", e.target.value)}
                            required={!draftEvent.is_free}
                          />
                        </Col>
                        <Col md={2}>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={() => removeDraftTicketRow(index)}
                            disabled={draftTickets.length <= 1}
                          >
                            Retirer
                          </button>
                        </Col>
                      </Row>
                    ))}
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addDraftTicketRow}>
                      + Ajouter un type de billet
                    </button>
                  </>
                )}
              </div>
              <div className="nolva-ai-card">
                <h4>Prestataires NOLVA recommandés</h4>
                {providers.length === 0 ? (
                  <p>Nous vous proposerons des prestataires dès que le catalogue local correspondra à votre besoin.</p>
                ) : (
                  <div className="nolva-ai-provider-list">
                    {providers.map((provider) => (
                      <Link key={provider.id} href={`/prestataires/${provider.id}`}>
                        {(provider.profilePhoto || provider.profile_photo || provider.avatar) && (
                          <img
                            src={provider.profilePhoto || provider.profile_photo || provider.avatar}
                            alt={provider.businessName || provider.business_name || "Prestataire"}
                          />
                        )}
                        <strong>{provider.businessName || provider.business_name || "Prestataire"}</strong>
                        <span>{provider.city || form.city || "Bénin"} · Note {provider.rating || provider.averageRating || "4.8"}/5</span>
                        <span>Prix estimatif : {provider.basePrice || provider.base_price ? `${Number(provider.basePrice || provider.base_price).toLocaleString("fr-FR")} FCFA` : "sur devis"}</span>
                        <small>Voir profil</small>
                      </Link>
                    ))}
                  </div>
                )}
                <button className="gi-btn-1 mt-3" onClick={downloadPdf}>Télécharger ma fiche événement</button>
                {isAuthenticated ? (
                  <button className="gi-btn-2 mt-2" onClick={submitForAdminValidation} disabled={submitting}>
                    {submitting ? "Soumission..." : "Soumettre à validation admin"}
                  </button>
                ) : (
                  <Link href="/register" className="gi-btn-2 mt-2">Sauvegardez votre projet gratuitement</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreateEventForm;
