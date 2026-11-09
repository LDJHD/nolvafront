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
import { BENIN_CITY_DATALIST_ID, beninCities } from "@/lib/beninCities";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

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
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nolva_event_wizard_step");
        if (saved) return Number(saved);
      } catch {}
    }
    return 0;
  });
  const [submitting, setSubmitting] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [providerTypes, setProviderTypes] = useState<{ slug: string; label: string }[]>([]);
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [publishedEventId, setPublishedEventId] = useState<number | null>(null);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [accessType, setAccessType] = useState<"free" | "paid" | "invite">("free");
  const [isPrivateEvent, setIsPrivateEvent] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>("");

  const [form, setForm] = useState({
    event_type: "",
    title: "",
    description: "",
    event_date: "",
    location: "",
    city: "",
    image: "",
    expected_participants: "",
    external_ticket_url: "",
    is_external_ticket: false,
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
      if (!isFreeEvent && step === 2 && d.suggested_tickets?.length) {
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
  }, [form.event_type, form.title, form.city, isFreeEvent, step]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  // Auto-save
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nolva_event_wizard_step", String(step));
      localStorage.setItem("nolva_event_wizard_form", JSON.stringify({ form, isFreeEvent, accessType, isPrivateEvent, tickets }));
    }
  }, [step, form, isFreeEvent, accessType, isPrivateEvent, tickets]);

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
      return isFreeEvent || tickets.some((t) => t.label.trim() && Number(t.quantity) >= 0);
    return true;
  };

  const handlePublish = async () => {
    const ticket_types = isFreeEvent
      ? []
      : tickets
          .filter((t) => t.label.trim())
          .map((t) => ({
            label: t.label.trim(),
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
          }));

    if (!isFreeEvent && ticket_types.length === 0) {
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
        external_ticket_url: form.is_external_ticket ? form.external_ticket_url : undefined,
        ticket_price: isFreeEvent ? 0 : undefined,
        ticket_count: isFreeEvent ? 0 : undefined,
        expected_participants: isFreeEvent && form.expected_participants
          ? Number(form.expected_participants)
          : undefined,
        auto_publish: true,
        is_private: isPrivateEvent,
      });
      const d = res.data;
      setProviderTypes(d.provider_types || []);
      setPublishedEventId(d.event?.id ?? null);
      showSuccessToast(d.message || "Événement publié !");
      localStorage.removeItem("nolva_event_wizard_step");
      localStorage.removeItem("nolva_event_wizard_form");
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

  const steps = ["Type", "Informations", "Billets", "Vérification"];

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
              a la validation administrateur avant sa mise en ligne.
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
                  <Form.Control
                    list={BENIN_CITY_DATALIST_ID}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Sélectionnez ou écrivez votre ville"
                  />
                  <datalist id={BENIN_CITY_DATALIST_ID}>
                    {beninCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
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
                  <Form.Label>Image principale</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImage} />
                </Col>
                <Col md={12}>
                  <Form.Label>Photos supplémentaires (max 3)</Form.Label>
                  <Form.Control type="file" accept="image/*" multiple onChange={(e) => {
                    const files = Array.from((e.target as any).files || []);
                    files.slice(0, 3 - images.length).forEach((file: any) => {
                      const reader = new FileReader();
                      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
                      reader.readAsDataURL(file);
                    });
                  }} />
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {images.map((img, i) => (
                      <img key={i} src={img} alt={`photo ${i + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                    ))}
                  </div>
                </Col>
                <Col md={12}>
                  <Form.Label>Vidéo (max 30s, facultatif)</Form.Label>
                  <Form.Control type="file" accept="video/*" onChange={(e) => {
                    const file = (e.target as any).files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      showErrorToast("Vidéo trop volumineuse (max 10 Mo)");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setVideo(String(reader.result));
                    reader.readAsDataURL(file);
                  }} />
                  {video && <p className="small text-success mt-1">Vidéo chargée ✓</p>}
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    id="wizard-private-event"
                    label="Événement privé (non visible publiquement, accès par lien)"
                    checked={isPrivateEvent}
                    onChange={(e) => setIsPrivateEvent(e.target.checked)}
                  />
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
                <Form.Label className="fw-bold mb-2">Comment les participants accèdent-ils à votre événement ?</Form.Label>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  {[
                    { key: "free", label: "Gratuit", icon: "fi fi-rr-gift", desc: "Accès libre" },
                    { key: "paid", label: "Payant", icon: "fi fi-rr-ticket", desc: "Billetterie" },
                    { key: "invite", label: "Sur invitation", icon: "fi fi-rr-envelope", desc: "Lien privé" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`nolva-access-card ${accessType === opt.key ? "selected" : ""}`}
                      onClick={() => {
                        setAccessType(opt.key as any);
                        setIsFreeEvent(opt.key === "free");
                      }}
                    >
                      <i className={opt.icon}></i>
                      <span className="fw-bold">{opt.label}</span>
                      <small>{opt.desc}</small>
                    </button>
                  ))}
                </div>

                {accessType === "free" && (
                  <>
                    <div className="alert alert-light border">
                      Aucun billet payant ne sera cree. L&apos;evenement restera gratuit.
                    </div>
                    <Row className="g-2 mb-3 align-items-end">
                      <Col md={5}>
                        <Form.Label>Nombre de participants attendus</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          name="expected_participants"
                          value={form.expected_participants}
                          onChange={handleChange}
                          placeholder="Ex : 150"
                        />
                      </Col>
                      <Col md={7}>
                        <p className="small text-muted mb-0">
                          Ce nombre s&apos;affichera sur la fiche (« X participants attendus ») et
                          servira de jauge de places pour l&apos;evenement.
                        </p>
                      </Col>
                    </Row>
                  </>
                )}
                {isFreeEvent && (
                  <>
                    <div className="alert alert-light border">
                      Aucun billet payant ne sera cree. L&apos;evenement restera gratuit.
                    </div>
                    <Row className="g-2 mb-3 align-items-end">
                      <Col md={5}>
                        <Form.Label>Nombre de participants attendus</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          name="expected_participants"
                          value={form.expected_participants}
                          onChange={handleChange}
                          placeholder="Ex : 150"
                        />
                      </Col>
                      <Col md={7}>
                        <p className="small text-muted mb-0">
                          Ce nombre s&apos;affichera sur la fiche (« X participants attendus ») et
                          servira de jauge de places pour l&apos;evenement.
                        </p>
                      </Col>
                    </Row>
                  </>
                )}
                <p className="small text-muted mb-3">
                  Définissez un libellé et un prix pour chaque type de billet (ex: Standard, VIP).
                  Quantité 0 = places illimitées.
                </p>
                {!isFreeEvent && tickets.map((t, i) => (
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
                {!isFreeEvent && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addTicketRow}>
                  + Ajouter un type de billet
                </button>}

                {!isFreeEvent && (
                  <div className="mt-3 p-3" style={{ background: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #E31E24" }}>
                    <Form.Check
                      type="switch"
                      id="wizard-external-ticket"
                      label="Billetterie externe (lien)"
                      checked={form.is_external_ticket}
                      onChange={(e) => setForm({ ...form, is_external_ticket: e.target.checked })}
                    />
                    {form.is_external_ticket && (
                      <Form.Group className="mt-2">
                        <Form.Label>Lien de billetterie externe</Form.Label>
                        <Form.Control
                          name="external_ticket_url"
                          value={form.external_ticket_url}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </Form.Group>
                    )}
                    {!form.is_external_ticket && tickets.some((t) => Number(t.price) > 0) && (
                      <div className="mt-2 small">
                        <strong>Frais NOLVA (5%) :</strong>
                        {tickets.filter((t) => t.label.trim()).map((t, i) => {
                          const price = Number(t.price) || 0;
                          const frais = Math.round(price * 0.05);
                          return (
                            <div key={i} className="mt-1">
                              {t.label} : Ticket {price.toLocaleString("fr-FR")} F — Frais {frais.toLocaleString("fr-FR")} F — Total participant { (price + frais).toLocaleString("fr-FR")} F
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div>
                <h5 className="mb-3">Voici ce que les visiteurs verront</h5>
                <div className="border rounded p-3" style={{ background: "#f8f9fa" }}>
                  {form.image && (
                    <img src={form.image} alt="affiche" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                  )}
                  <h4>{form.title}</h4>
                  <p className="text-muted mb-1">{form.event_type} — {form.city}</p>
                  <p className="mb-1"><strong>Lieu :</strong> {form.location || "À confirmer"}</p>
                  <p className="mb-1"><strong>Date :</strong> {form.event_date}</p>
                  {form.description && <p className="mb-2">{form.description}</p>}
                  <p className="mb-1">
                    <strong>Accès :</strong>{" "}
                    {accessType === "free" ? "Gratuit" : accessType === "invite" ? "Sur invitation" : "Payant"}
                  </p>
                  {!isFreeEvent && tickets.filter((t) => t.label.trim()).length > 0 && (
                    <div className="mb-2">
                      <strong>Billets :</strong>
                      <ul className="mb-0">
                        {tickets.filter((t) => t.label.trim()).map((t, i) => (
                          <li key={i}>{t.label} — {Number(t.price).toLocaleString("fr-FR")} FCFA ({t.quantity || "∞"} places)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {form.is_external_ticket && form.external_ticket_url && (
                    <p className="mb-1"><strong>Billetterie externe :</strong> {form.external_ticket_url}</p>
                  )}
                  {isPrivateEvent && (
                    <p className="text-warning mb-1"><i className="fi fi-rr-lock"></i> Événement privé (non visible publiquement)</p>
                  )}
                  {form.expected_participants && (
                    <p className="mb-1"><strong>Participants attendus :</strong> {form.expected_participants}</p>
                  )}
                  {images.length > 0 && (
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {images.map((img, i) => (
                        <img key={i} src={img} alt={`photo ${i + 1}`} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="button" className="gi-btn-2" onClick={() => setStep(2)}>
                    MODIFIER
                  </button>
                  <button type="button" className="gi-btn-1" disabled={submitting} onClick={() => void handlePublish()}>
                    {submitting ? "Publication..." : "PUBLIER MON ÉVÉNEMENT"}
                  </button>
                </div>
              </div>
            )}

            {step < 3 && (
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
                <button
                  type="button"
                  className="gi-btn-1"
                  disabled={!canNext()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Suivant
                </button>
                <Link href="/evenements" className="gi-btn-2">
                  Annuler
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal show={showProvidersModal} onHide={() => setShowProvidersModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Événement publié</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Votre evenement a ete soumis a la validation administrateur. Pour le reussir, vous aurez probablement besoin de ces
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
