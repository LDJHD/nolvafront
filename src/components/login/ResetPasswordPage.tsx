"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { Container, Form } from "react-bootstrap";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { authApi } from "@/lib/api";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setTokenValid(false);
      return;
    }
    authApi
      .verifyResetToken(token)
      .then((res) => setTokenValid(Boolean(res.data?.valid)))
      .catch(() => setTokenValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showErrorToast("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirmation) {
      showErrorToast("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      showSuccessToast(res.data?.message || "Mot de passe mis à jour.");
      router.push("/login");
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Nouveau mot de passe" />
      <section className="gi-login padding-tb-40">
        <Container>
          <div className="section-title-2">
            <h2 className="gi-title">
              Nouveau mot de passe<span></span>
            </h2>
          </div>
          <div className="gi-login-content">
            <div className="gi-login-box" style={{ maxWidth: 520, margin: "0 auto" }}>
              <div className="gi-login-wrapper">
                <div className="gi-login-container">
                  <div className="gi-login-form">
                    {checking ? (
                      <p>Vérification du lien...</p>
                    ) : !tokenValid ? (
                      <div>
                        <p className="text-danger mb-3">
                          Ce lien est invalide ou a expiré. Demandez un nouveau lien.
                        </p>
                        <Link href="/mot-de-passe/oublie" className="gi-btn-1">
                          Nouvelle demande
                        </Link>
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmit}>
                        <span className="gi-login-wrap">
                          <label>Nouveau mot de passe *</label>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                          />
                        </span>
                        <span className="gi-login-wrap" style={{ marginTop: 16 }}>
                          <label>Confirmer le mot de passe *</label>
                          <Form.Control
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            minLength={8}
                            required
                          />
                        </span>
                        <span className="gi-login-wrap gi-login-btn" style={{ marginTop: 24 }}>
                          <Link href="/login">Annuler</Link>
                          <button className="gi-btn-1 btn" type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer"}
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

export default ResetPasswordPage;
