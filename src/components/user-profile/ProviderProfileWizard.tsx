"use client";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { providersApi } from "@/lib/api";
import { showSuccessToast, showErrorToast } from "../toast-popup/Toastify";

interface Props {
  onDone?: () => void;
}

const ProviderProfileWizard = ({ onDone }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    type: "",
    city: "",
    description: "",
    logo: "",
    travel_possible: false,
    travel_fees: false,
    is_available: true,
  });
  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [services, setServices] = useState<{ name: string; description: string; price: string }[]>([
    { name: "", description: "", price: "" },
  ]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const addActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity("");
    }
  };

  const removeActivity = (a: string) => setActivities(activities.filter((x) => x !== a));

  const addService = () => setServices([...services, { name: "", description: "", price: "" }]);
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));
  const updateService = (i: number, field: string, value: string) => {
    setServices(services.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (photos.length < 7) setPhotos([...photos, String(reader.result)]);
    };
    reader.readAsDataURL(file);
  };

  const saveStep = async () => {
    setSaving(true);
    try {
      await providersApi.updateMyProfile({
        business_name: form.business_name,
        type: form.type || "autre",
        city: form.city,
        description: form.description,
        profile_photo: form.logo || undefined,
        travel_possible: form.travel_possible,
        travel_fees: form.travel_fees,
        is_available: form.is_available,
      });
      showSuccessToast(`Étape ${step}/3 enregistrée.`);
      if (step < 3) setStep((step + 1) as 1 | 2 | 3);
      else {
        showSuccessToast("Profil publié avec succès !");
        onDone?.();
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nolva-provider-wizard">
      <div className="nolva-wizard-progress">
        <div className="nolva-wizard-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>
      <p className="nolva-wizard-label">Profil : {step}/3</p>

      {step === 1 && (
        <div className="nolva-wizard-step">
          <h4>Votre activité</h4>
          <Form.Group className="mb-3">
            <Form.Label>Nom professionnel / Nom commercial *</Form.Label>
            <Form.Control name="business_name" value={form.business_name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Que faites-vous ?</Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Form.Control value={newActivity} onChange={(e) => setNewActivity(e.target.value)} placeholder="Ex: Photographe" />
              <button type="button" className="nolva-btn-secondary" onClick={addActivity}>Ajouter</button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {activities.map((a) => (
                <span key={a} className="nolva-activity-tag">
                  {a} <button type="button" onClick={() => removeActivity(a)}>×</button>
                </span>
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ville principale *</Form.Label>
            <Form.Control name="city" value={form.city} onChange={handleChange} required />
          </Form.Group>
        </div>
      )}

      {step === 2 && (
        <div className="nolva-wizard-step">
          <h4>Présentez votre activité</h4>
          <Form.Group className="mb-3">
            <Form.Label>Logo ou photo principale</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => {
              const file = (e.target as any).files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setForm({ ...form, logo: String(reader.result) });
              reader.readAsDataURL(file);
            }} />
            {form.logo && <img src={form.logo} alt="logo" style={{ maxWidth: 120, marginTop: 8 }} />}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description de votre activité</Form.Label>
            <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange} />
            <small className="text-muted">💡 M&apos;aider à rédiger</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Photos de réalisations (max 7)</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handlePhotoUpload} />
            <div className="d-flex flex-wrap gap-2 mt-2">
              {photos.map((p, i) => (
                <img key={i} src={p} alt={`photo ${i + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
              ))}
            </div>
          </Form.Group>
        </div>
      )}

      {step === 3 && (
        <div className="nolva-wizard-step">
          <h4>Vos services</h4>
          {services.map((svc, i) => (
            <div key={i} className="nolva-service-row mb-3 p-3 border rounded">
              <Form.Group className="mb-2">
                <Form.Label>Nom du service</Form.Label>
                <Form.Control value={svc.name} onChange={(e) => updateService(i, "name", e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Courte description</Form.Label>
                <Form.Control value={svc.description} onChange={(e) => updateService(i, "description", e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Prix ou &quot;sur devis&quot;</Form.Label>
                <Form.Control value={svc.price} onChange={(e) => updateService(i, "price", e.target.value)} placeholder="Ex: 50000 ou Sur devis" />
              </Form.Group>
              {services.length > 1 && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeService(i)}>Supprimer</button>
              )}
            </div>
          ))}
          <button type="button" className="nolva-btn-secondary mb-3" onClick={addService}>+ Ajouter un service</button>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Déplacement possible ?"
              checked={form.travel_possible}
              onChange={(e) => setForm({ ...form, travel_possible: e.target.checked })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Zone d&apos;intervention</Form.Label>
            <Form.Control value={form.city} onChange={handleChange} name="city" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Disponible"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            />
          </Form.Group>
        </div>
      )}

      <div className="nolva-wizard-actions">
        {step > 1 && (
          <button type="button" className="nolva-btn-secondary" onClick={() => setStep((step - 1) as 1 | 2 | 3)} disabled={saving}>
            Retour
          </button>
        )}
        <button type="button" className="nolva-btn-primary" onClick={saveStep} disabled={saving}>
          {saving ? "Enregistrement..." : step === 3 ? "PUBLIER MON PROFIL" : "CONTINUER"}
        </button>
      </div>
    </div>
  );
};

export default ProviderProfileWizard;
