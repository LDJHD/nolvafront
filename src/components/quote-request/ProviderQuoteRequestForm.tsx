"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { Form } from "react-bootstrap";
import { providersApi, quoteRequestsApi } from "@/lib/api";
import { useEventTypes } from "@/lib/useCatalog";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const ProviderQuoteRequestForm = () => {
  const router = useRouter();
  const params = useParams();
  const providerId = params?.id as string;
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { types: eventTypes } = useEventTypes();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    event_type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    proposed_price: "",
    message: "",
  });

  useEffect(() => {
    if (!providerId) return;
    providersApi
      .show(providerId)
      .then((res) => setProvider(res.data))
      .catch(() => setProvider(null));
  }, [providerId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_type || !form.event_date || !form.start_time || !form.end_time || !form.proposed_price) {
      showErrorToast("Remplissez tous les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const res = await quoteRequestsApi.create({
        provider_id: Number(providerId),
        event_type: form.event_type,
        event_date: form.event_date,
        start_time: form.start_time,
        end_time: form.end_time,
        proposed_price: Number(form.proposed_price),
        message: form.message.trim(),
      });
      showSuccessToast(res.data?.message || "Demande envoyée");
      const qid = res.data?.quoteRequest?.id;
      router.push(qid ? `/devis/${qid}` : "/user-dashboard");
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <p>Connectez-vous pour demander un devis.</p>
        <Link href="/login" className="gi-btn-1">Se connecter</Link>
      </div>
    );
  }

  const businessName = provider?.businessName || provider?.business_name || "Prestataire";

  return (
    <section className="gi-login padding-tb-40">
      <div className="container">
        <div className="gi-vendor-dashboard-card" style={{ padding: "30px", maxWidth: 720, margin: "0 auto" }}>
          <h4>Demande de devis — {businessName}</h4>
          <p className="text-muted mb-4">
            Précisez votre événement. Le prestataire pourra valider ou discuter avec vous sur la plateforme.
          </p>
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-semibold">Type d&apos;événement *</label>
              <Form.Select name="event_type" value={form.event_type} onChange={handleChange} required>
                <option value="">Sélectionner...</option>
                {eventTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.label}</option>
                ))}
              </Form.Select>
            </div>
            <div className="mb-3">
              <label className="fw-semibold">Date *</label>
              <Form.Control type="date" name="event_date" value={form.event_date} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="fw-semibold">Heure de début *</label>
                <Form.Control type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
              </div>
              <div className="col-6">
                <label className="fw-semibold">Heure de fin *</label>
                <Form.Control type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="fw-semibold">Prix proposé (FCFA) *</label>
              <Form.Control
                type="number"
                name="proposed_price"
                min={0}
                step={1}
                inputMode="numeric"
                value={form.proposed_price}
                onChange={handleChange}
                required
                placeholder="Ex. 50000"
              />
            </div>
            <div className="mb-3">
              <label className="fw-semibold">Description *</label>
              <Form.Control as="textarea" rows={4} name="message" value={form.message} onChange={handleChange} required placeholder="Décrivez votre besoin, le lieu, les attentes..." />
            </div>
            <button type="submit" className="gi-btn-1 w-100" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer la demande de devis"}
            </button>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default ProviderQuoteRequestForm;
