"use client";
import { useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Form, Container } from "react-bootstrap";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { setCredentials } from "@/store/reducers/authSlice";
import { authApi } from "@/lib/api";
import { parseRegisterError } from "@/lib/registerErrors";
import Link from "next/link";

const phoneCountries = [
  { code: "+229", label: "Bénin (+229)" },
  { code: "+228", label: "Togo (+228)" },
  { code: "+225", label: "Côte d'Ivoire (+225)" },
  { code: "+226", label: "Burkina Faso (+226)" },
  { code: "+234", label: "Nigeria (+234)" },
];

// Backward-compatible exports for template components (ProfileEdit, VandorEdit, etc.)
export const getRegistrationData = () => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('nolva_user')
  if (!data) return []
  try {
    return [JSON.parse(data)]
  } catch {
    return []
  }
}

export const setRegistrationData = (data: any[]) => {
  if (typeof window === 'undefined') return
  if (data.length > 0) {
    localStorage.setItem('nolva_user', JSON.stringify(data[data.length - 1]))
  }
}

type AccountRole = "user" | "provider";

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<AccountRole | "">("");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_country: "+229",
    phone: "+229 ",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneCountryChange = (e: any) => {
    const code = e.target.value;
    const localPhone = form.phone.replace(/^\+\d{1,4}\s*/, "");
    setForm({
      ...form,
      phone_country: code,
      phone: code === "+229" ? `${code} ${localPhone}`.trim() : localPhone,
    });
  };

  const normalizedPhone = () => {
    const compact = form.phone.replace(/\s+/g, "");
    if (compact.startsWith(form.phone_country)) return compact;
    return `${form.phone_country}${compact.replace(/^\+?\d{1,4}/, "")}`;
  };

  const goToStepTwo = () => {
    if (!role) {
      showErrorToast("Choisissez d'abord votre profil pour continuer.");
      return;
    }
    setStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const backToStepOne = () => {
    setStep(1);
    setValidated(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!consent) {
      showErrorToast("Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.");
      return;
    }
    if (e.currentTarget.checkValidity() === false) {
      setValidated(true);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: normalizedPhone(),
        password: form.password,
        role: role || "user",
      };
      const res = await authApi.register(payload);
      const { token, user } = res.data;
      dispatch(setCredentials({ user, token: token.value || token }));
      const baseMessage = res.data?.message || "Compte créé. Consultez votre email.";
      showSuccessToast(`${baseMessage} Complétez votre profil.`);
      router.push("/user-profile");
    } catch (err: any) {
      showErrorToast(parseRegisterError(err));
    } finally {
      setLoading(false);
      setValidated(true);
    }
  };

  return (
    <>
      <Breadcrumb title={"Inscription"} />
      <section className="nolva-auth-section padding-tb-40">
        <Container>
          <div className="nolva-auth-card">
            <div className="nolva-auth-head">
              <span className="nolva-auth-eyebrow">Étape {step} sur 2</span>
              {step === 1 ? (
                <>
                  <h2 className="nolva-auth-title">Comment souhaitez-vous utiliser NOLVA ?</h2>
                  <p className="nolva-auth-subtitle">
                    Choisissez votre profil pour commencer. Vous pourrez faire évoluer votre compte plus tard.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="nolva-auth-title">Créez votre compte</h2>
                  <p className="nolva-auth-subtitle">
                    Quelques informations essentielles, puis vous pourrez compléter votre profil à votre rythme.
                  </p>
                  <div className="nolva-auth-summary">
                    <span className="nolva-role-pill">
                      <i className={role === "provider" ? "fi fi-rr-briefcase" : "fi fi-rr-user"} aria-hidden="true"></i>
                      Profil : {role === "provider" ? "Prestataire" : "Participant"}
                    </span>
                    <button type="button" className="nolva-link-button" onClick={backToStepOne}>
                      Modifier
                    </button>
                  </div>
                </>
              )}
            </div>

            {step === 1 ? (
              <>
                <div className="nolva-role-grid">
                  <button
                    type="button"
                    className={`nolva-role-choice ${role === "user" ? "selected" : ""}`}
                    onClick={() => setRole("user")}
                    aria-pressed={role === "user"}
                  >
                    <span className="nolva-role-check" aria-hidden="true">✓</span>
                    <span className="nolva-role-icon"><i className="fi fi-rr-user" aria-hidden="true"></i></span>
                    <span className="nolva-role-name">PARTICIPANT</span>
                    <span className="nolva-role-desc">
                      Je découvre des événements, achète mes billets et recherche des prestataires.
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`nolva-role-choice ${role === "provider" ? "selected" : ""}`}
                    onClick={() => setRole("provider")}
                    aria-pressed={role === "provider"}
                  >
                    <span className="nolva-role-check" aria-hidden="true">✓</span>
                    <span className="nolva-role-icon"><i className="fi fi-rr-briefcase" aria-hidden="true"></i></span>
                    <span className="nolva-role-name">PRESTATAIRE</span>
                    <span className="nolva-role-desc">
                      Je propose mes services et souhaite recevoir des demandes.
                    </span>
                  </button>
                </div>

                <p className="nolva-auth-note">
                  <i className="fi fi-rr-info" aria-hidden="true"></i> Aucun choix n&apos;est sélectionné par défaut.
                </p>

                <div className="nolva-auth-actions">
                  <button
                    type="button"
                    className="nolva-btn-primary nolva-btn-block"
                    onClick={goToStepTwo}
                    disabled={!role}
                  >
                    CONTINUER
                  </button>
                </div>

                <p className="nolva-auth-footnote">
                  Déjà un compte ? <Link href="/login">Se connecter</Link>
                </p>
              </>
            ) : (
              <Form noValidate validated={validated} onSubmit={handleSubmit} className="nolva-register-form nolva-auth-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="nolva-register-field">
                      <label htmlFor="reg-first_name">Prénom *</label>
                      <Form.Group controlId="reg-first_name">
                        <Form.Control type="text" name="first_name" placeholder="Votre prénom"
                          value={form.first_name} onChange={handleChange} required autoComplete="given-name" />
                        <Form.Control.Feedback type="invalid">Prénom requis.</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="nolva-register-field">
                      <label htmlFor="reg-last_name">Nom *</label>
                      <Form.Group controlId="reg-last_name">
                        <Form.Control type="text" name="last_name" placeholder="Votre nom"
                          value={form.last_name} onChange={handleChange} required autoComplete="family-name" />
                        <Form.Control.Feedback type="invalid">Nom requis.</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="nolva-register-field">
                      <label htmlFor="reg-phone">Téléphone *</label>
                      <Form.Group controlId="reg-phone" className="nolva-phone-field">
                        <Form.Select name="phone_country" value={form.phone_country} onChange={handlePhoneCountryChange} aria-label="Indicatif pays">
                          {phoneCountries.map((country) => (
                            <option key={country.code} value={country.code}>{country.label}</option>
                          ))}
                        </Form.Select>
                        <Form.Control type="tel" name="phone" placeholder="+229 XX XX XX XX"
                          value={form.phone} onChange={handleChange} required autoComplete="tel" />
                        <Form.Control.Feedback type="invalid">Numéro requis.</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="nolva-register-field">
                      <label htmlFor="reg-email">Email *</label>
                      <Form.Group controlId="reg-email">
                        <Form.Control type="email" name="email" placeholder="votre@email.com"
                          value={form.email} onChange={handleChange} required autoComplete="email" />
                        <Form.Control.Feedback type="invalid">Email valide requis.</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="nolva-register-field">
                      <label htmlFor="reg-password">Mot de passe *</label>
                      <Form.Group controlId="reg-password" className="nolva-password-field">
                        <Form.Control type={showPassword ? "text" : "password"} name="password" placeholder="Au moins 8 caractères"
                          value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher le mot de passe">
                          <i className={showPassword ? "fi fi-rr-eye-crossed" : "fi fi-rr-eye"}></i>
                        </button>
                        <Form.Control.Feedback type="invalid">Au moins 8 caractères.</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>
                </div>

                <label className={`nolva-consent ${validated && !consent ? "is-invalid" : ""}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                  />
                  <span>
                    J&apos;accepte les{" "}
                    <Link href="/terms-condition" target="_blank" rel="noopener noreferrer">
                      Conditions Générales d&apos;Utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">
                      Politique de confidentialité
                    </Link>
                    .
                  </span>
                </label>
                <p className="nolva-auth-note nolva-auth-note-small">
                  L&apos;acceptation de ces documents est obligatoire pour créer votre compte.
                </p>

                <div className="nolva-auth-actions">
                  <button
                    type="button"
                    className="nolva-btn-secondary"
                    onClick={backToStepOne}
                    disabled={loading}
                  >
                    Retour
                  </button>
                  <button
                    className="nolva-btn-primary nolva-btn-grow"
                    type="submit"
                    disabled={loading || !consent}
                  >
                    {loading ? "CRÉATION EN COURS..." : "CRÉER MON COMPTE"}
                  </button>
                </div>

                <p className="nolva-auth-footnote">
                  Déjà inscrit ? <Link href="/login">Se connecter</Link>
                </p>
              </Form>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default RegisterPage;
