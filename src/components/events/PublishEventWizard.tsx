"use client";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { eventsApi } from "@/lib/api";
import { useEventTypes } from "@/lib/useCatalog";
import { emptyTicketRow, type TicketDraft } from "@/lib/eventPublishGuide";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const beninCities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Ouidah"];

const formatEventDateForApi = (local: string): string => {
  if (!local) return local;
  if (local.includes("T")) {
    const [date, time] = local.split("T");
    const t = time.length === 5 ? `${time}:00` : time;
    return `${date} ${t}`;
  }
  return local;
};

const PublishEventWizard = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: eventTypes, loading: typesLoading } = useEventTypes();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [providerTypes, setProviderTypes] = useState<{ slug: string; label: string }[]>([]);
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [publishedEventId, setPublishedEventId] = useState<number | null>(null);

  const [form, setForm] = useState({
    event_type: "",
    title: "",
    description: "",
    event_date: "",
    location: "",
    city: "",
    image: "",
  });
  const [tickets, setTickets] = useState<TicketDraft[]>([
    { label: "Standard", price: "5000", quantity: "100" },
  ]);

  const loadSuggestions = useCallback(async () => {
    if (!form.event_type) return;
    try {
      const res = await eventsApi.publishSuggestions({
        event_type: form.event_type,
        title: form.title,
        city: form.city,
      });
      const d = res.data;
      setTips(d.tips || []);
      if (step === 2 && d.suggested_tickets?.length) {
        setTickets(
          d.suggested_tickets.map((s: { label: string; priceHint: number }) => ({
            label: s.label,
            price: String(s.priceHint ?? 0),
            quantity: "100",
          }))
        );
      }
    } catch {
      setTips([]);
    }
  }, [form.event_type, form.title, form.city, step]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        setForm((prev) => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateTicket = (index: number, field: keyof TicketDraft, value: string) => {
    setTickets((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTicketRow = () => setTickets((prev) => [...prev, emptyTicketRow()]);
  const removeTicketRow = (index: number) =>
    setTickets((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const canNext = () => {
    if (step === 0) return !!form.event_type;
    if (step === 1)
      return !!form.title.trim() && !!form.event_date && !!form.city;
    if (step === 2)
      return tickets.some((t) => t.label.trim() && Number(t.quantity) >= 0);
    return true;
  };

  const handlePublish = async () => {
    const ticket_types = tickets
      .filter((t) => t.label.trim())
      .map((t) => ({
        label: t.label.trim(),
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 0,
      }));

    if (ticket_types.length === 0) {
      showErrorToast("Ajoutez au moins un type de billet");
      return;
    }

    setSubmitting(true);
    try {
      const res = await eventsApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        event_type: form.event_type,
        event_date: formatEventDateForApi(form.event_date),
        location: form.location.trim() || undefined,
        city: form.city,
        image: form.image || undefined,
        ticket_types,
        auto_publish: true,
      });
      const d = res.data;
      setProviderTypes(d.provider_types || []);
      setPublishedEventId(d.event?.id ?? null);
      showSuccessToast(d.message || "Événement publié !");
      setShowProvidersModal(true);
    } catch (err: any) {
      showErrorToast(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Erreur lors de la publication"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="padding-tb-40">
        <div className="container text-center">
          <p>Connectez-vous pour publier un événement sur NOLVA.</p>
          <Link href="/login" className="gi-btn-1">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  const steps = ["Type", "Informations", "Billets", "Publication"];

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="gi-vendor-dashboard-card" style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div className="gi-vendor-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 style={{ margin: 0 }}>Publier un événement</h5>
            <span className="badge bg-secondary">
              Étape {step + 1} / {steps.length} — {steps[step]}
            </span>
          </div>
          <div className="gi-vendor-card-body p-4">
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Assistant NOLVA : nous vous guidons étape par étape. Votre événement sera publié
              directement sur la plateforme (sans validation admin).
            </p>

            {step === 0 && (
              <>
                <Form.Label>Type d&apos;événement *</Form.Label>
                <Form.Select
                  name="event_type"
                  value={form.event_type}
                  onChange={(e) => {
                    handleChange(e);
                    setStep(0);
                  }}
                  required
                  disabled={typesLoading}
                >
                  <option value="">Choisir un type</option>
                  {eventTypes.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
                {form.event_type && tips.length > 0 && (
                  <div
                    className="mt-3 p-3"
                    style={{ background: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #E31E24" }}
                  >
                    <strong>
                      <i className="fi fi-rr-bulb me-1" /> Conseils NOLVA
                    </strong>
                    <ul className="mb-0 mt-2 small">
                      {tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label>Titre *</Form.Label>
                  <Form.Control
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex: Concert live à Cotonou"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre événement, le programme, les accès..."
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Date et heure *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Ville *</Form.Label>
                  <Form.Select name="city" value={form.city} onChange={handleChange}>
                    <option value="">Choisir</option>
                    {beninCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label>Lieu</Form.Label>
                  <Form.Control
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex: Palais des Congrès"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label>Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImage} />
                </Col>
                {tips.length > 0 && (
                  <Col md={12}>
                    <div className="small text-muted">
                      <i className="fi fi-rr-bulb" /> {tips[0]}
                    </div>
                  </Col>
                )}
              </Row>
            )}

            {step === 2 && (
              <>
                <p className="small text-muted mb-3">
                  Définissez un libellé et un prix pour chaque type de billet (ex: Standard, VIP).
                  Quantité 0 = places illimitées.
                </p>
                {tickets.map((t, i) => (
                  <Row className="g-2 mb-3 align-items-end" key={i}>
                    <Col md={4}>
                      <Form.Label>Libellé</Form.Label>
                      <Form.Control
                        value={t.label}
                        onChange={(e) => updateTicket(i, "label", e.target.value)}
                        placeholder="Ex: VIP"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>Prix (FCFA)</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        step={1}
                        value={t.price}
                        onChange={(e) => updateTicket(i, "price", e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>Places</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={t.quantity}
                        onChange={(e) => updateTicket(i, "quantity", e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => removeTicketRow(i)}
                        disabled={tickets.length <= 1}
                      >
                        Retirer
                      </button>
                    </Col>
                  </Row>
                ))}
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addTicketRow}>
                  + Ajouter un type de billet
                </button>
              </>
            )}

            {step === 3 && (
              <div className="small">
                <p>
                  <strong>{form.title}</strong> — {form.city}
                </p>
                <p>
                  Billets :{" "}
                  {tickets
                    .filter((t) => t.label.trim())
                    .map((t) => `${t.label} (${Number(t.price).toLocaleString("fr-FR")} FCFA)`)
                    .join(", ")}
                </p>
                <p className="text-muted mb-0">
                  Paiement des participants via FedaPay (séquestre NOLVA). Publication immédiate.
                </p>
              </div>
            )}

            <div className="d-flex gap-2 mt-4 flex-wrap">
              {step > 0 && (
                <button
                  type="button"
                  className="gi-btn-2"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={submitting}
                >
                  Précédent
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  className="gi-btn-1"
                  disabled={!canNext()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  className="gi-btn-1"
                  disabled={submitting}
                  onClick={() => void handlePublish()}
                >
                  {submitting ? "Publication..." : "Publier mon événement"}
                </button>
              )}
              <Link href="/evenements" className="gi-btn-2">
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showProvidersModal} onHide={() => setShowProvidersModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Événement publié</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Votre événement est en ligne. Pour le réussir, vous aurez probablement besoin de ces
            types de prestataires sur NOLVA :
          </p>
          <ul>
            {providerTypes.map((p) => (
              <li key={p.slug}>
                <Link href={`/prestataires?type=${p.slug}`}>{p.label}</Link>
              </li>
            ))}
          </ul>
          {publishedEventId && (
            <p className="mb-0">
              <Link href={`/evenements/${publishedEventId}`} className="gi-btn-1 d-inline-block mt-2">
                Voir mon événement
              </Link>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Link href="/demande-devis" className="gi-btn-2 me-2">
            Demander un devis
          </Link>
          <button
            type="button"
            className="gi-btn-1"
            onClick={() => {
              setShowProvidersModal(false);
              router.push(publishedEventId ? `/evenements/${publishedEventId}` : "/evenements");
            }}
          >
            Terminer
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default PublishEventWizard;
