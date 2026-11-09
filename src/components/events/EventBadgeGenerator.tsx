"use client";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { eventsApi } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Props {
  eventId: number;
  eventTitle: string;
}

const EventBadgeGenerator = ({ eventId, eventTitle }: Props) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [forOther, setForOther] = useState(false);
  const [form, setForm] = useState({
    holder_name: "",
    holder_email: "",
    holder_phone: "",
    holder_photo: "",
  });
  const [generating, setGenerating] = useState(false);
  const [badge, setBadge] = useState<any>(null);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, holder_photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: any) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showErrorToast("Vous devez être connecté pour générer un badge.");
      return;
    }
    if (!form.holder_name.trim()) {
      showErrorToast("Le nom du titulaire est requis.");
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        event_id: eventId,
        holder_name: forOther ? form.holder_name : (user?.firstName + " " + user?.lastName),
        holder_email: forOther ? form.holder_email : user?.email,
        holder_phone: forOther ? form.holder_phone : user?.phone,
        holder_photo: form.holder_photo || (forOther ? "" : user?.avatar),
        is_for_other: forOther,
      };
      const res = await eventsApi.generateBadge(payload);
      setBadge(res.data.badge);
      showSuccessToast("Badge généré avec succès !");
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de la génération du badge.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="nolva-badge-generator">
      <h5>Générer un badge pour : {eventTitle}</h5>

      <Form onSubmit={handleGenerate}>
        <div className="mb-3">
          <Form.Check
            type="checkbox"
            label="Générer pour une autre personne"
            checked={forOther}
            onChange={(e) => setForOther(e.target.checked)}
          />
        </div>

        {forOther && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Nom du titulaire *</Form.Label>
              <Form.Control name="holder_name" value={form.holder_name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="holder_email" value={form.holder_email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control name="holder_phone" value={form.holder_phone} onChange={handleChange} />
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Photo du titulaire</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handlePhoto} />
          {form.holder_photo && (
            <img src={form.holder_photo} alt="photo" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
          )}
        </Form.Group>

        {!forOther && !form.holder_photo && user?.avatar && (
          <p className="text-muted small">Votre photo de profil sera utilisée.</p>
        )}

        <button type="submit" className="nolva-btn-primary" disabled={generating}>
          {generating ? "Génération..." : "GÉNÉRER LE BADGE"}
        </button>
      </Form>

      {badge && (
        <div className="nolva-badge-result mt-4">
          <div className="nolva-badge-card">
            <div className="nolva-badge-header">
              <h4>NOLVA — Badge d&apos;accès</h4>
              <p>{badge.event?.title || eventTitle}</p>
            </div>
            <div className="nolva-badge-body">
              {badge.holderPhoto && (
                <img src={badge.holderPhoto} alt="photo" className="nolva-badge-photo" />
              )}
              <div className="nolva-badge-info">
                <p><strong>Nom :</strong> {badge.holderName}</p>
                {badge.holderEmail && <p><strong>Email :</strong> {badge.holderEmail}</p>}
                {badge.holderPhone && <p><strong>Tél :</strong> {badge.holderPhone}</p>}
                <p><strong>Code :</strong> {badge.badgeCode}</p>
              </div>
            </div>
          </div>
          <button type="button" className="nolva-btn-secondary mt-3" onClick={handlePrint}>
            Imprimer / Télécharger
          </button>
        </div>
      )}
    </div>
  );
};

export default EventBadgeGenerator;
