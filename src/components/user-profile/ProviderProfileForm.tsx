"use client";
import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { offersApi, providersApi } from "@/lib/api";
import {
  PAYOUT_METHOD_OPTIONS,
  payoutDestinationLabel,
  payoutDestinationPlaceholder,
} from "@/lib/payoutMethods";
import PayoutMessagesPanel from "../vendor/PayoutMessagesPanel";
import { useEventTypes, useProviderTypes } from "@/lib/useCatalog";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const beninCities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Bohicon", "Natitingou", "Ouidah"];
const MAX_PORTFOLIO_PHOTOS = 7;

const safeParseArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const compressImage = (file: File, max = 1200): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > max) {
          h = (h * max) / w;
          w = max;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = String(reader.result || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type OfferForm = {
  id?: number;
  name: string;
  duration: string;
  price_min: string;
  price_max: string;
  includedText: string;
};

const ProviderProfileForm = () => {
  const { types: providerTypes } = useProviderTypes();
  const { types: eventTypes } = useEventTypes();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [offers, setOffers] = useState<OfferForm[]>([]);
  const [previewProfilePhoto, setPreviewProfilePhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    type: "",
    specialty: "",
    experience_years: "",
    city: "",
    description: "",
    travel_possible: false,
    is_available: true,
    instagram: "",
    facebook: "",
    tiktok: "",
    profile_photo: "",
    event_types: [] as string[],
    momo_network: "",
    momo_phone: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await providersApi.myProfile();
      const p = res.data;
      setForm({
        business_name: p.businessName || p.business_name || "",
        type: p.type || "",
        specialty: p.specialty || "",
        experience_years: p.experienceYears || p.experience_years || "",
        city: p.city || "",
        description: p.description || "",
        travel_possible: Boolean(p.travelPossible ?? p.travel_possible),
        is_available: Boolean(p.isAvailable ?? p.is_available ?? true),
        instagram: p.instagram || "",
        facebook: p.facebook || "",
        tiktok: p.tiktok || "",
        profile_photo: p.profilePhoto || p.profile_photo || "",
        event_types: safeParseArray(p.eventTypes || p.event_types),
        momo_network: p.momoNetwork || p.momo_network || "",
        momo_phone: p.momoPhone || p.momo_phone || "",
      });
      setPhotos(p.photos || []);
      setOffers(
        (p.offers || []).map((o: any) => ({
          id: o.id,
          name: o.name || "",
          duration: o.duration || "",
          price_min: String(o.priceMin ?? o.price_min ?? ""),
          price_max: String(o.priceMax ?? o.price_max ?? ""),
          includedText: safeParseArray(o.included).join("\n"),
        }))
      );
    } catch {
      showErrorToast("Impossible de charger votre profil prestataire.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleEventType = (slug: string) => {
    setForm((prev) => {
      const set = new Set(prev.event_types);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
      return { ...prev, event_types: Array.from(set) };
    });
  };

  const onProfilePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showErrorToast("Image trop volumineuse (max 3 Mo)");
      return;
    }
    try {
      const dataUrl = await compressImage(file, 1200);
      setPreviewProfilePhoto(dataUrl);
      setForm((prev) => ({ ...prev, profile_photo: dataUrl }));
    } catch {
      showErrorToast("Erreur lors du chargement de l'image");
    }
  };

  const onPortfolioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= MAX_PORTFOLIO_PHOTOS) {
      showErrorToast(`Maximum ${MAX_PORTFOLIO_PHOTOS} photos dans le portfolio`);
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showErrorToast("Image trop volumineuse (max 3 Mo)");
      return;
    }
    try {
      const url = await compressImage(file, 1200);
      await providersApi.addPhoto({ url });
      showSuccessToast("Photo ajoutée au portfolio");
      void loadProfile();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur ajout photo");
    }
    e.target.value = "";
  };

  const removePhoto = async (id: number) => {
    try {
      await providersApi.deletePhoto(id);
      showSuccessToast("Photo supprimée");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      showErrorToast("Erreur suppression photo");
    }
  };

  const updateOfferField = (index: number, field: keyof OfferForm, value: string) => {
    setOffers((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  };

  const addOffer = () => {
    if (offers.length >= 3) {
      showErrorToast("Maximum 3 offres");
      return;
    }
    setOffers((prev) => [
      ...prev,
      { name: "", duration: "", price_min: "", price_max: "", includedText: "" },
    ]);
  };

  const saveOffer = async (offer: OfferForm, index: number) => {
    if (!offer.name.trim()) {
      showErrorToast("Nom de l'offre requis");
      return;
    }
    const payload = {
      name: offer.name.trim(),
      duration: offer.duration || undefined,
      price_min: offer.price_min ? Number(offer.price_min) : undefined,
      price_max: offer.price_max ? Number(offer.price_max) : undefined,
      included: offer.includedText
        ? offer.includedText.split("\n").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };
    try {
      if (offer.id) {
        await offersApi.update(offer.id, payload);
        showSuccessToast(`Offre « ${offer.name} » mise à jour`);
      } else {
        const res = await offersApi.create(payload);
        const created = res.data?.offer;
        setOffers((prev) =>
          prev.map((o, i) => (i === index ? { ...o, id: created?.id } : o))
        );
        showSuccessToast(`Offre « ${offer.name} » créée`);
      }
      void loadProfile();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur enregistrement offre");
    }
  };

  const deleteOffer = async (offer: OfferForm, index: number) => {
    if (!offer.id) {
      setOffers((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      await offersApi.delete(offer.id);
      showSuccessToast("Offre supprimée");
      setOffers((prev) => prev.filter((_, i) => i !== index));
    } catch {
      showErrorToast("Erreur suppression offre");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim() || !form.type) {
      showErrorToast("Nom commercial et type de prestation sont obligatoires");
      return;
    }
    setSaving(true);
    try {
      await providersApi.updateMyProfile({
        business_name: form.business_name.trim(),
        type: form.type,
        specialty: form.specialty || undefined,
        experience_years: form.experience_years || undefined,
        city: form.city || undefined,
        description: form.description || undefined,
        travel_possible: form.travel_possible,
        is_available: form.is_available,
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
        tiktok: form.tiktok || undefined,
        profile_photo: form.profile_photo || undefined,
        event_types: form.event_types,
        momo_network: form.momo_network || undefined,
        momo_phone: form.momo_phone || undefined,
      });
      showSuccessToast("Profil prestataire enregistré. Il apparaît comme sur votre fiche publique.");
      setPreviewProfilePhoto(null);
      void loadProfile();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted mt-4">Chargement du profil prestataire...</p>;
  }

  const profilePhotoSrc =
    previewProfilePhoto ||
    form.profile_photo ||
    `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/avatar/placeholder.jpg`;

  return (
    <div className="mt-5 pt-4 border-top">
      <h3 className="gi-title mb-1">
        Profil prestataire<span></span>
      </h3>
      <p className="text-muted mb-4">
        Complétez les mêmes informations que sur votre fiche publique (page détail prestataire).
      </p>

      <Form onSubmit={onSubmit}>
        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <h5 className="mb-3">Informations</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Nom commercial *</label>
              <Form.Control
                name="business_name"
                value={form.business_name}
                onChange={onChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label>Type de prestation *</label>
              <Form.Select name="type" value={form.type} onChange={onChange} required>
                <option value="">Choisir...</option>
                {providerTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6">
              <label>Spécialité</label>
              <Form.Control name="specialty" value={form.specialty} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label>Années d&apos;expérience</label>
              <Form.Control
                name="experience_years"
                value={form.experience_years}
                onChange={onChange}
                placeholder="Ex: 5"
              />
            </div>
            <div className="col-md-6">
              <label>Ville</label>
              <Form.Select name="city" value={form.city} onChange={onChange}>
                <option value="">Sélectionner...</option>
                {beninCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6 d-flex align-items-end gap-4">
              <Form.Check
                type="checkbox"
                id="is_available"
                name="is_available"
                label="Disponible"
                checked={form.is_available}
                onChange={onChange}
              />
              <Form.Check
                type="checkbox"
                id="travel_possible"
                name="travel_possible"
                label="Déplacement possible"
                checked={form.travel_possible}
                onChange={onChange}
              />
            </div>
            <div className="col-12">
              <label>Photo vitrine (affichée sur votre fiche)</label>
              <div className="d-flex align-items-center gap-3 mt-2">
                <img
                  src={profilePhotoSrc}
                  alt="Photo vitrine"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
                <Form.Control type="file" accept="image/*" onChange={onProfilePhotoFile} />
              </div>
            </div>
          </div>
        </div>

        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <h5 className="mb-3">À propos</h5>
          <Form.Control
            as="textarea"
            className="nolva-about-textarea"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Présentez votre activité, votre expérience, vos services..."
          />
        </div>

        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <h5 className="mb-3">Types d&apos;événements</h5>
          <div className="row g-2">
            {eventTypes.map((et) => (
              <div key={et.slug} className="col-md-4 col-6">
                <Form.Check
                  type="checkbox"
                  id={`et-${et.slug}`}
                  label={et.label}
                  checked={form.event_types.includes(et.slug)}
                  onChange={() => toggleEventType(et.slug)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Offres et tarifs</h5>
            <button type="button" className="gi-btn-2 btn-sm" onClick={addOffer} disabled={offers.length >= 3}>
              Ajouter une offre
            </button>
          </div>
          {offers.length === 0 && (
            <p className="text-muted small">Aucune offre. Ajoutez jusqu&apos;à 3 offres comme sur votre fiche publique.</p>
          )}
          {offers.map((offer, index) => (
            <div key={offer.id ?? `new-${index}`} className="border rounded p-3 mb-3">
              <div className="row g-2">
                <div className="col-md-6">
                  <label>Nom de l&apos;offre *</label>
                  <Form.Control
                    value={offer.name}
                    onChange={(e) => updateOfferField(index, "name", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label>Durée</label>
                  <Form.Control
                    value={offer.duration}
                    onChange={(e) => updateOfferField(index, "duration", e.target.value)}
                    placeholder="Ex: 4 heures"
                  />
                </div>
                <div className="col-md-6">
                  <label>Prix min (FCFA)</label>
                  <Form.Control
                    type="number"
                    value={offer.price_min}
                    onChange={(e) => updateOfferField(index, "price_min", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label>Prix max (FCFA)</label>
                  <Form.Control
                    type="number"
                    value={offer.price_max}
                    onChange={(e) => updateOfferField(index, "price_max", e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label>Éléments inclus (un par ligne)</label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={offer.includedText}
                    onChange={(e) => updateOfferField(index, "includedText", e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button type="button" className="gi-btn-1 btn-sm" onClick={() => saveOffer(offer, index)}>
                  Enregistrer l&apos;offre
                </button>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteOffer(offer, index)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="gi-vendor-dashboard-card mb-4 p-4 nolva-portfolio-edit">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">Portfolio</h5>
            <span className="text-muted small">
              {photos.length} / {MAX_PORTFOLIO_PHOTOS} photos
            </span>
          </div>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={onPortfolioFile}
            className="mb-3"
            disabled={photos.length >= MAX_PORTFOLIO_PHOTOS}
          />
          <div className="nolva-portfolio-grid nolva-portfolio-grid--edit">
            {photos.map((photo: any) => (
              <div key={photo.id} className="nolva-portfolio-edit-item position-relative">
                <img src={photo.url} alt="portfolio" />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <h5 className="mb-3">Coordonnées de reversement</h5>
          <p className="small text-muted">
            Réseaux pris en charge par FedaPay au Bénin (Mobile Money ou carte). L&apos;administrateur utilisera ces
            informations pour vos versements.
          </p>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Mode de paiement *</label>
              <Form.Select name="momo_network" value={form.momo_network} onChange={onChange}>
                <option value="">Choisir...</option>
                {PAYOUT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6">
              <label>
                {form.momo_network
                  ? payoutDestinationLabel(form.momo_network)
                  : "Coordonnées de réception"}
              </label>
              <Form.Control
                name="momo_phone"
                value={form.momo_phone}
                onChange={onChange}
                placeholder={
                  form.momo_network
                    ? payoutDestinationPlaceholder(form.momo_network)
                    : "Sélectionnez d'abord un mode"
                }
                disabled={!form.momo_network}
              />
            </div>
          </div>
        </div>

        <PayoutMessagesPanel />

        <div className="gi-vendor-dashboard-card mb-4 p-4">
          <h5 className="mb-3">Réseaux sociaux</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label>Instagram (pseudo)</label>
              <Form.Control name="instagram" value={form.instagram} onChange={onChange} placeholder="sans @" />
            </div>
            <div className="col-md-4">
              <label>Facebook</label>
              <Form.Control name="facebook" value={form.facebook} onChange={onChange} />
            </div>
            <div className="col-md-4">
              <label>TikTok (pseudo)</label>
              <Form.Control name="tiktok" value={form.tiktok} onChange={onChange} placeholder="sans @" />
            </div>
          </div>
        </div>

        <button className="gi-btn-1" type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer le profil prestataire"}
        </button>
      </Form>
    </div>
  );
};

export default ProviderProfileForm;
