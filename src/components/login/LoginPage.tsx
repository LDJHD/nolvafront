"use client";
import Link from "next/link";
import { useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { Container, Form } from "react-bootstrap";
import { showErrorToast, showSuccessToast, showToast } from "../toast-popup/Toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCredentials } from "@/store/reducers/authSlice";
import { authApi } from "@/lib/api";

const LoginPage = () => {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  if (isAuthenticated) {
    if (userRole === "admin") router.push("/admin");
    else if (userRole === "provider") router.push("/vendor-dashboard");
    else router.push("/home");
    return null;
  }

  const handleGoogleLogin = () => {
    showToast('Fonctionnalité bientôt disponible')
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ uid, password });
      const { token, user } = res.data;
      dispatch(setCredentials({ user, token: token.value || token }));
      showSuccessToast("Connexion réussie ! Bienvenue sur NOLVA.");
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "provider") {
        router.push("/vendor-dashboard");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Email/téléphone ou mot de passe incorrect.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
      setValidated(true);
    }
  };

  return (
    <>
      <Breadcrumb title={"Connexion"} />
      <section className="gi-login padding-tb-40">
        <Container>
          <div className="section-title-2">
            <h2 className="gi-title">
              Connexion<span></span>
            </h2>
            <p>Accédez à votre espace NOLVA et gérez vos événements.</p>
          </div>
          <div className="gi-login-content">
            <div className="gi-login-box">
              <div className="gi-login-wrapper">
                <div className="gi-login-container">
                  <div className="gi-login-form">
                    <button
                      type="button"
                      className="nolva-google-btn"
                      onClick={handleGoogleLogin}
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                        <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.3 5.3C40.9 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
                      </svg>
                      Continuer avec Google
                    </button>
                    <div className="nolva-auth-divider"><span>ou</span></div>
                    <Form noValidate validated={validated} onSubmit={handleLogin}>
                      <span className="gi-login-wrap">
                        <label>Email ou téléphone *</label>
                        <Form.Group>
                          <Form.Control
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            placeholder="Entrez votre email ou téléphone"
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Veuillez entrer votre email ou numéro de téléphone.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </span>

                      <span style={{ marginTop: "24px" }} className="gi-login-wrap">
                        <label>Mot de passe *</label>
                        <Form.Group className="nolva-password-field">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                            minLength={6}
                          />
                          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher le mot de passe">
                            <i className={showPassword ? "fi fi-rr-eye-crossed" : "fi fi-rr-eye"}></i>
                          </button>
                          <Form.Control.Feedback type="invalid">
                            Le mot de passe doit contenir au moins 6 caractères.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </span>

                      <span style={{ marginTop: "12px", display: "block", textAlign: "right" }}>
                        <Link href="/mot-de-passe/oublie" className="small">
                          Mot de passe oublié ?
                        </Link>
                      </span>

                      <span className="gi-login-wrap gi-login-btn" style={{ marginTop: "24px" }}>
                        <span>
                          <Link href="/register">Créer un compte ?</Link>
                        </span>
                        <button
                          className="gi-btn-1 btn"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "Connexion..." : "Se connecter"}
                        </button>
                      </span>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
            <div className="gi-login-box d-n-991">
              <div className="gi-login-img">
                <img
                  src={"/assets/img/common/login.png"}
                  alt="connexion nolva"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default LoginPage;
