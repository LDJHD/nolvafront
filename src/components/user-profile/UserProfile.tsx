"use client";
import { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { authApi } from "@/lib/api";
import { initFromStorage, updateUser } from "@/store/reducers/authSlice";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import Link from "next/link";
import ProviderProfileForm from "./ProviderProfileForm";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    dispatch(initFromStorage());
    setBooting(false);
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const syncMe = async () => {
      try {
        const res = await authApi.me();
        if (res.data) {
          dispatch(updateUser(res.data));
        }
      } catch {
        // silent sync failure
      }
    };
    syncMe();
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  const avatarSrc = useMemo(
    () =>
      previewAvatar ||
      form.avatar ||
      `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/avatar/placeholder.jpg`,
    [previewAvatar, form.avatar]
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const source = new Image();
      source.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 320;
        const ratio = Math.min(maxSize / source.width, maxSize / source.height, 1);
        const width = Math.round(source.width * ratio);
        const height = Math.round(source.height * ratio);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(source, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        setPreviewAvatar(compressed);
        setForm((prev) => ({ ...prev, avatar: compressed }));
      };
      source.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      const updated = res.data?.user;
      if (updated) {
        dispatch(updateUser(updated));
      }
      showSuccessToast("Profil mis a jour avec succes.");
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur lors de la mise a jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  if (booting) {
    return (
      <div className="container py-5 text-center">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-5 text-center">
        <p>
          Connectez-vous pour acceder a votre profil. <Link href="/login">Se connecter</Link>
        </p>
      </div>
    );
  }

  return (
    <section className="gi-register padding-tb-40">
      <div className="container">
        <div className="section-title-2">
          <h2 className="gi-title">
            Mon profil<span></span>
          </h2>
          <p>Mettez a jour vos informations personnelles{user.role === "provider" ? " et votre fiche prestataire" : ""}.</p>
        </div>

        <div className="gi-register-wrapper">
          <div className="gi-register-container">
            <div className="gi-register-form">
              <Form onSubmit={onSubmit}>
                <div className="text-center mb-4">
                  <img
                    src={avatarSrc}
                    alt="avatar utilisateur"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #f2f2f2",
                    }}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Prenom *</label>
                    <Form.Control
                      name="first_name"
                      value={form.first_name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Nom *</label>
                    <Form.Control
                      name="last_name"
                      value={form.last_name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Email</label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email || ""}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Telephone</label>
                    <Form.Control
                      name="phone"
                      value={form.phone || ""}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Ville</label>
                    <Form.Control name="city" value={form.city || ""} onChange={onChange} />
                  </div>
                  <div className="col-md-6">
                    <label>Photo de profil</label>
                    <Form.Control type="file" accept="image/*" onChange={onFile} />
                  </div>
                </div>

                <div className="gi-register-wrap gi-register-btn mt-4">
                  <span>
                    Role : <strong>{user.role}</strong>
                  </span>
                  <button className="gi-btn-1" type="submit" disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </Form>

              {user.role === "provider" && <ProviderProfileForm />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
