"use client";
import Link from "next/link";
import { useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { Container, Form } from "react-bootstrap";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCredentials } from "@/store/reducers/authSlice";
import { authApi } from "@/lib/api";

const LoginPage = () => {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
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
                        <Form.Group>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                            minLength={6}
                          />
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
                  src={process.env.NEXT_PUBLIC_URL + "/assets/img/common/login.png"}
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
