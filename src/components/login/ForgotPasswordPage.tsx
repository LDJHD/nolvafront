"use client";
import Link from "next/link";
import { useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { Container, Form } from "react-bootstrap";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { authApi } from "@/lib/api";

const ForgotPasswordPage = () => {
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevLink("");
    try {
      const res = await authApi.forgotPassword({ uid: uid.trim() });
      setSent(true);
      showSuccessToast(res.data?.message || "Demande envoyée.");
      if (res.data?.reset_url) {
        setDevLink(res.data.reset_url);
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Mot de passe oublié" />
      <section className="gi-login padding-tb-40">
        <Container>
          <div className="section-title-2">
            <h2 className="gi-title">
              Mot de passe oublié<span></span>
            </h2>
            <p>
              Saisissez l&apos;email associé à votre compte NOLVA. Un lien de réinitialisation vous
              sera envoyé (valide 1 heure).
            </p>
          </div>
          <div className="gi-login-content">
            <div className="gi-login-box" style={{ maxWidth: 520, margin: "0 auto" }}>
              <div className="gi-login-wrapper">
                <div className="gi-login-container">
                  <div className="gi-login-form">
                    {sent ? (
                      <div>
                        <p className="text-muted mb-3">
                          Si un compte existe avec cet identifiant, vérifiez votre boîte mail
                          (et les spams).
                        </p>
                        {devLink && (
                          <div className="alert alert-warning small">
                            <strong>Mode développement :</strong>
                            <br />
                            <a href={devLink}>{devLink}</a>
                          </div>
                        )}
                        <Link href="/login" className="gi-btn-1 d-inline-block mt-2">
                          Retour à la connexion
                        </Link>
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmit}>
                        <span className="gi-login-wrap">
                          <label>Email ou téléphone du compte *</label>
                          <Form.Control
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            placeholder="email@exemple.com"
                            required
                          />
                          <Form.Text className="text-muted">
                            La réinitialisation par lien nécessite un email enregistré sur le compte.
                          </Form.Text>
                        </span>
                        <span className="gi-login-wrap gi-login-btn" style={{ marginTop: 24 }}>
                          <Link href="/login">Retour connexion</Link>
                          <button className="gi-btn-1 btn" type="submit" disabled={loading}>
                            {loading ? "Envoi..." : "Envoyer le lien"}
                          </button>
                        </span>
                      </Form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default ForgotPasswordPage;
