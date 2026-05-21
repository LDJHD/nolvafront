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
import { useProviderTypes } from "@/lib/useCatalog";
import Link from "next/link";

const beninCities = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Abomey", "Natitingou", "Ouidah"];

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

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { types: providerTypes, loading: typesLoading } = useProviderTypes();

  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    business_name: "",
    type: "",
    description: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity() === false) {
      setValidated(true);
      return;
    }
    if (form.password !== form.confirmPassword) {
      showErrorToast("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        city: form.city,
      };
      if (role === "provider") {
        payload.business_name = form.business_name;
        payload.type = form.type;
        payload.description = form.description;
      }
      const res = await authApi.register(payload);
      const { token, user } = res.data;
      dispatch(setCredentials({ user, token: token.value || token }));
      showSuccessToast("Compte cree ! Bienvenue sur NOLVA.");
      router.push(user.role === "provider" ? "/vendor-dashboard" : "/home");
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
      <section className="gi-register padding-tb-40">
        <Container>
          <div className="section-title-2">
            <h2 className="gi-title">
              Inscription<span></span>
            </h2>
            <p>Rejoignez NOLVA - La plateforme evenementielle du Benin.</p>
          </div>

          <div className="nolva-role-selector mb-4">
            <div className="row justify-content-center g-3">
              <div className="col-md-5">
                <div
                  className={`nolva-role-card ${role === "user" ? "active" : ""}`}
                  onClick={() => setRole("user")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fi fi-rr-user"></i>
                  <h6>Utilisateur</h6>
                  <p>Je recherche des prestataires pour mon evenement</p>
                </div>
              </div>
              <div className="col-md-5">
                <div
                  className={`nolva-role-card ${role === "provider" ? "active" : ""}`}
                  onClick={() => setRole("provider")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fi fi-rr-briefcase"></i>
                  <h6>Prestataire</h6>
                  <p>Je propose mes services pour des evenements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="gi-register-wrapper">
              <div className="gi-register-container">
                <div className="gi-register-form">
                  <Form noValidate validated={validated} onSubmit={handleSubmit} className="nolva-register-form">

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-first_name">Prénom *</label>
                          <Form.Group controlId="reg-first_name">
                            <Form.Control type="text" name="first_name" placeholder="Votre prénom"
                              value={form.first_name} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Prénom requis.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-last_name">Nom *</label>
                          <Form.Group controlId="reg-last_name">
                            <Form.Control type="text" name="last_name" placeholder="Votre nom"
                              value={form.last_name} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Nom requis.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-email">Email *</label>
                          <Form.Group controlId="reg-email">
                            <Form.Control type="email" name="email" placeholder="votre@email.com"
                              value={form.email} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Email valide requis.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-phone">Téléphone *</label>
                          <Form.Group controlId="reg-phone">
                            <Form.Control type="tel" name="phone" placeholder="+229 XX XX XX XX"
                              value={form.phone} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Numéro requis.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-password">Mot de passe *</label>
                          <Form.Group controlId="reg-password">
                            <Form.Control type="password" name="password" placeholder="Au moins 8 caractères"
                              value={form.password} onChange={handleChange} required minLength={8} />
                            <Form.Control.Feedback type="invalid">Au moins 8 caractères.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-confirmPassword">Confirmer le mot de passe *</label>
                          <Form.Group controlId="reg-confirmPassword">
                            <Form.Control type="password" name="confirmPassword" placeholder="Répétez le mot de passe"
                              value={form.confirmPassword} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Confirmation requise.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="nolva-register-field">
                          <label htmlFor="reg-city">Ville *</label>
                          <Form.Group controlId="reg-city" className="gi-rg-select-inner">
                            <Form.Select name="city" value={form.city} onChange={handleChange}
                              required className="gi-register-select">
                              <option value="">Sélectionnez votre ville</option>
                              {beninCities.map((c) => (
                                <option key={c} value={c.toLowerCase()}>{c}</option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Ville requise.</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>
                    </div>

                    {role === "provider" && (
                      <div className="nolva-provider-fields mt-4">
                        <h6 className="mb-3" style={{ color: "var(--nolva-red)" }}>
                          Informations prestataire
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="nolva-register-field">
                              <label htmlFor="reg-business_name">Nom commercial *</label>
                              <Form.Group controlId="reg-business_name">
                                <Form.Control type="text" name="business_name" placeholder="Nom de votre activité"
                                  value={form.business_name} onChange={handleChange} required={role === "provider"} />
                                <Form.Control.Feedback type="invalid">Nom commercial requis.</Form.Control.Feedback>
                              </Form.Group>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="nolva-register-field">
                              <label htmlFor="reg-type">Type de prestation *</label>
                              <Form.Group controlId="reg-type" className="gi-rg-select-inner">
                                <Form.Select name="type" value={form.type} onChange={handleChange}
                                  required={role === "provider"} className="gi-register-select" disabled={typesLoading}>
                                  <option value="">Choisissez votre type</option>
                                  {providerTypes.map((t) => (
                                    <option key={t.slug} value={t.slug}>{t.label}</option>
                                  ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Type requis.</Form.Control.Feedback>
                              </Form.Group>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="nolva-register-field">
                              <label htmlFor="reg-description">Description de votre activité</label>
                              <Form.Group controlId="reg-description">
                                <Form.Control as="textarea" rows={3} name="description"
                                  placeholder="Décrivez votre activité, votre expérience..."
                                  value={form.description} onChange={handleChange} />
                              </Form.Group>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="gi-register-wrap gi-register-btn mt-4">
                      <span>
                        Deja inscrit ? <Link href="/login">Se connecter</Link>
                      </span>
                      <button className="gi-btn-1" type="submit" disabled={loading}>
                        {loading ? "Creation en cours..." : "Creer mon compte"}
                      </button>
                    </span>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default RegisterPage;
