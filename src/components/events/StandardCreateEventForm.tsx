"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Col, Form, Row } from "react-bootstrap";
import { eventsApi } from "@/lib/api";
import { emptyTicketRow, type TicketDraft } from "@/lib/eventPublishGuide";
import { useEventTypes } from "@/lib/useCatalog";
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

const StandardCreateEventForm = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasStoredSession =
    isAuthenticated || (typeof window !== "undefined" && !!localStorage.getItem("nolva_token"));
  const { types: eventTypes, loading: typesLoading } = useEventTypes();
  const [submitting, setSubmitting] = useState(false);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
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
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketTypes = isFreeEvent
      ? []
      : tickets
          .filter((t) => t.label.trim())
          .map((t) => ({
            label: t.label.trim(),
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
          }));

    if (!isFreeEvent && ticketTypes.length === 0) {
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
        ticket_types: ticketTypes,
        ticket_price: isFreeEvent ? 0 : undefined,
        ticket_count: isFreeEvent ? 0 : undefined,
      });
      showSuccessToast(
        res.data?.message ||
          "Evenement cree avec succes. Il sera visible apres validation par l'administration."
      );
      router.push("/user-dashboard");
    } catch (err: any) {
      showErrorToast(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Erreur lors de la creation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasStoredSession) {
    return (
      <section className="padding-tb-40">
        <div className="container text-center">
          <p>Connectez-vous pour creer un evenement sur NOLVA.</p>
          <Link href="/login" className="gi-btn-1">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="gi-vendor-dashboard-card" style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div className="gi-vendor-card-header">
            <h5 style={{ margin: 0 }}>Creer mon evenement</h5>
          </div>
          <div className="gi-vendor-card-body p-4">
            <Form onSubmit={submit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Type d&apos;evenement *</Form.Label>
                  <Form.Select
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
                    disabled={typesLoading}
                    required
                  >
                    <option value="">Choisir un type</option>
                    {eventTypes.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Titre *</Form.Label>
                  <Form.Control
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex: Concert live a Cotonou"
                    required
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
                    placeholder="Programme, acces, informations utiles..."
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Date et heure *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Ville *</Form.Label>
                  <Form.Select name="city" value={form.city} onChange={handleChange} required>
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
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex: Palais des Congres"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImage} />
                </Col>
              </Row>

              <hr className="my-4" />

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <h6 className="fw-semibold mb-0">Billets</h6>
                <Form.Check
                  type="switch"
                  id="standard-free-event"
                  label="Evenement gratuit"
                  checked={isFreeEvent}
                  onChange={(e) => setIsFreeEvent(e.target.checked)}
                />
              </div>

              {isFreeEvent ? (
                <div className="alert alert-light border">
                  Les champs de billets sont masques. L&apos;evenement sera soumis comme gratuit.
                </div>
              ) : (
                <>
                  {tickets.map((ticket, index) => (
                    <Row className="g-2 mb-3 align-items-end" key={index}>
                      <Col md={4}>
                        <Form.Label>Libelle</Form.Label>
                        <Form.Control
                          value={ticket.label}
                          onChange={(e) => updateTicket(index, "label", e.target.value)}
                          placeholder="Standard, VIP..."
                          required={!isFreeEvent}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Prix (FCFA)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          step={1}
                          value={ticket.price}
                          onChange={(e) => updateTicket(index, "price", e.target.value)}
                          required={!isFreeEvent}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Places</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          value={ticket.quantity}
                          onChange={(e) => updateTicket(index, "quantity", e.target.value)}
                          required={!isFreeEvent}
                        />
                      </Col>
                      <Col md={2}>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => removeTicketRow(index)}
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

              <div className="alert alert-info mt-4 mb-0">
                Tout evenement cree doit etre valide par l&apos;administration avant d&apos;apparaitre sur la plateforme.
              </div>

              <div className="d-flex gap-2 mt-4 flex-wrap">
                <button type="submit" className="gi-btn-1" disabled={submitting}>
                  {submitting ? "Creation..." : "Creer mon evenement"}
                </button>
                <Link href="/evenements" className="gi-btn-2">
                  Annuler
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardCreateEventForm;
