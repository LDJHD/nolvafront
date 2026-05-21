"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { quoteRequestsApi, providersApi } from "@/lib/api";
import { getProviderLabel } from "@/lib/providerUtils";
import { normalizeList } from "@/lib/nolvaData";
import { useEventTypes, useProviderTypes } from "@/lib/useCatalog";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { showSuccessToast } from "../toast-popup/Toastify";

const cities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Bohicon", "Natitingou", "Ouidah"];

const QuoteRequestForm = () => {
  const { types: eventTypes } = useEventTypes();
  const { types: providerTypes } = useProviderTypes();
  const searchParams = useSearchParams();
  const preselectedProvider = searchParams.get("provider");
  const preselectedType = searchParams.get("type") || "";

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const [form, setForm] = useState({
    provider_id: preselectedProvider || "",
    provider_type: preselectedType,
    event_type: "",
    event_date: "",
    guest_count: "",
    budget: "",
    city: "",
    message: "",
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params: { type?: string; limit: number } = { limit: 50 };
    if (form.provider_type) params.type = form.provider_type;
    providersApi
      .list(params)
      .then((res) => setProviders(normalizeList(res.data)))
      .catch(() => setProviders([]));
  }, [form.provider_type]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "provider_id" && value) {
      const picked = providers.find((p: any) => String(p.id) === String(value));
      if (picked?.type) {
        setForm((prev) => ({ ...prev, provider_id: value, provider_type: picked.type }));
        return;
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!form.provider_type && !form.provider_id) {
      setError("Choisissez au minimum un type de prestataire, ou un prestataire précis.");
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        event_type: form.event_type,
        event_date: form.event_date,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        city: form.city,
        message: form.message.trim(),
      };
      if (form.provider_type) payload.provider_type = form.provider_type;
      if (form.provider_id) payload.provider_id = Number(form.provider_id);

      const res = await quoteRequestsApi.create(payload);
      setSuccess(true);
      if (res.data?.message) showSuccessToast(res.data.message);
      setForm({
        provider_id: "",
        provider_type: "",
        event_type: "",
        event_date: "",
        guest_count: "",
        budget: "",
        city: "",
        message: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="gi-login padding-tb-40">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="gi-vendor-dashboard-card" style={{ padding: "40px", textAlign: "center" }}>
                <h4 style={{ marginBottom: "15px" }}>Connexion requise</h4>
                <p style={{ marginBottom: "20px", color: "#666" }}>
                  Vous devez être connecté pour envoyer une demande de devis.
                </p>
                <Link href="/login" className="gi-btn-1" style={{ marginRight: "10px" }}>
                  Se connecter
                </Link>
                <Link href="/register" className="gi-btn-2">
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="gi-login padding-tb-40">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="gi-vendor-dashboard-card" style={{ padding: "30px" }}>
              <h4 style={{ marginBottom: "5px" }}>Demande de devis</h4>
              <p style={{ marginBottom: "25px", color: "#666" }}>
                Décrivez votre événement et recevez un devis. Choisissez un type de prestataire ;
                vous pouvez cibler un prestataire précis ou laisser le champ vide pour toucher tous
                les professionnels de ce type.
              </p>

              {success && (
                <div className="alert alert-success" style={{ marginBottom: "20px", padding: "15px", background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "8px", color: "#1e40af" }}>
                  Votre demande de devis a été envoyée avec succès ! Le prestataire vous contactera rapidement.
                </div>
              )}

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: "20px", padding: "15px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Type de prestataire */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Type de prestataire *
                    </label>
                    <select
                      name="provider_type"
                      className="form-control"
                      value={form.provider_type}
                      onChange={handleChange}
                      required
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="">Sélectionner un type...</option>
                      {providerTypes.map((opt) => (
                        <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Prestataire spécifique */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Prestataire (optionnel)
                    </label>
                    <select
                      name="provider_id"
                      className="form-control"
                      value={form.provider_id}
                      onChange={handleChange}
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="">Aucun — tous les prestataires du type</option>
                      {providers.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {getProviderLabel(p)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type d'événement */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Type d&apos;événement *
                    </label>
                    <select
                      name="event_type"
                      className="form-control"
                      value={form.event_type}
                      onChange={handleChange}
                      required
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="">Sélectionner...</option>
                      {eventTypes.map((type) => (
                        <option key={type.slug} value={type.slug}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Date de l&apos;événement *
                    </label>
                    <input
                      type="date"
                      name="event_date"
                      className="form-control"
                      value={form.event_date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>

                  {/* Ville */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Ville *
                    </label>
                    <select
                      name="city"
                      className="form-control"
                      value={form.city}
                      onChange={handleChange}
                      required
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="">Sélectionner...</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre d'invités */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Nombre d&apos;invités
                    </label>
                    <input
                      type="number"
                      name="guest_count"
                      className="form-control"
                      placeholder="Ex: 150"
                      value={form.guest_count}
                      onChange={handleChange}
                      min="1"
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>

                  {/* Budget */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Budget (FCFA)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      className="form-control"
                      placeholder="Ex: 500000"
                      value={form.budget}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>

                  {/* Message */}
                  <div className="col-12 mb-3">
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: "6px", display: "block" }}>
                      Décrivez votre besoin *
                    </label>
                    <textarea
                      name="message"
                      className="form-control"
                      rows={5}
                      placeholder="Décrivez votre événement, vos attentes, le lieu, les horaires..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", resize: "vertical" }}
                    ></textarea>
                  </div>

                  <div className="col-12" style={{ marginTop: "10px" }}>
                    <button
                      type="submit"
                      className="gi-btn-1"
                      disabled={loading}
                      style={{ width: "100%", padding: "12px", fontSize: "16px" }}
                    >
                      {loading ? "Envoi en cours..." : "Envoyer ma demande de devis"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteRequestForm;
