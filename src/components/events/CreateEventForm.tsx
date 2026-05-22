"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Col, Form, Row } from "react-bootstrap";
import { eventsApi } from "@/lib/api";
import { useEventTypes } from "@/lib/useCatalog";
import { emptyTicketRow, type TicketDraft } from "@/lib/eventPublishGuide";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const beninCities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Ouidah"];

const CreateEventForm = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: eventTypes, loading: typesLoading } = useEventTypes();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "",
    event_date: "",
    location: "",
    city: "",
    image: "",
  });
  const [tickets, setTickets] = useState<TicketDraft[]>([
    { label: "Standard", price: "0", quantity: "0" },
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
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        setForm((prev) => ({ ...prev, image: compressed }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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

  const updateTicket = (index: number, field: keyof TicketDraft, value: string) => {
    setTickets((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date || !form.event_type) {
      showErrorToast("Titre, type et date sont obligatoires");
      return;
    }

    const ticket_types = tickets
      .filter((t) => t.label.trim())
      .map((t) => ({
        label: t.label.trim(),
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 0,
      }));

    setSubmitting(true);
    try {
      const res = await eventsApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        event_type: form.event_type,
        event_date: formatEventDateForApi(form.event_date),
        location: form.location.trim() || undefined,
        city: form.city || undefined,
        image: form.image || undefined,
        ticket_types: ticket_types.length > 0 ? ticket_types : undefined,
        ticket_price:
          ticket_types.length === 0
            ? 0
            : Math.min(...ticket_types.map((t) => t.price).filter((p) => p >= 0)),
        ticket_count:
          ticket_types.length === 0
            ? 0
            : ticket_types.reduce((s, t) => s + t.quantity, 0),
      });
      showSuccessToast(
        res.data?.message ||
          "Événement soumis. Il sera visible après validation par NOLVA."
      );
      router.push("/evenements");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg =
        errors?.[0]?.message ||
        err.response?.data?.message ||
        "Erreur lors de la création";
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="padding-tb-40">
        <div className="container text-center">
          <p>Connectez-vous pour créer un événement sur NOLVA.</p>
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
        <div className="gi-vendor-dashboard-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="gi-vendor-card-header">
            <h5 style={{ margin: 0 }}>Créer mon événement</h5>
          </div>
          <div className="gi-vendor-card-body p-4">
            <p style={{ color: "#666", marginBottom: "12px" }}>
              Formulaire complet avec validation admin. Pour une publication immédiate, utilisez{" "}
              <Link href="/evenements/publier">Publier un événement</Link>.
            </p>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label>Titre de l&apos;événement *</Form.Label>
                  <Form.Control
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Concert live à Cotonou"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Type d&apos;événement *</Form.Label>
                  <Form.Select
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
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
                </Col>
                <Col md={12}>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre événement..."
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
                  <Form.Label>Ville</Form.Label>
                  <Form.Select name="city" value={form.city} onChange={handleChange}>
                    <option value="">Choisir une ville</option>
                    {beninCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label>Lieu / adresse</Form.Label>
                  <Form.Control
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex: Palais des Congrès"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold">Types de billets</Form.Label>
                  <p className="small text-muted mb-2">
                    Libellé et prix pour chaque billet. Laissez vide une ligne pour l&apos;ignorer.
                  </p>
                  {tickets.map((t, i) => (
                    <Row className="g-2 mb-2" key={i}>
                      <Col md={4}>
                        <Form.Control
                          placeholder="Libellé (ex: VIP)"
                          value={t.label}
                          onChange={(e) => updateTicket(i, "label", e.target.value)}
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Prix FCFA"
                          value={t.price}
                          onChange={(e) => updateTicket(i, "price", e.target.value)}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          min={0}
                          placeholder="Places"
                          value={t.quantity}
                          onChange={(e) => updateTicket(i, "quantity", e.target.value)}
                        />
                      </Col>
                      <Col md={1}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            setTickets((prev) =>
                              prev.length <= 1 ? prev : prev.filter((_, j) => j !== i)
                            )
                          }
                        >
                          ×
                        </button>
                      </Col>
                    </Row>
                  ))}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mb-3"
                    onClick={() => setTickets((prev) => [...prev, emptyTicketRow()])}
                  >
                    + Type de billet
                  </button>
                </Col>
                <Col md={12}>
                  <Form.Label>Image de couverture</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImage} />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Aperçu"
                      style={{
                        marginTop: "12px",
                        maxHeight: "160px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-4 flex-wrap">
                <button type="submit" className="gi-btn-1" disabled={submitting}>
                  {submitting ? "Envoi..." : "Soumettre pour validation"}
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

export default CreateEventForm;
