"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/reducers/authSlice";
import { authApi } from "@/lib/api";
import Spinner from "@/components/button/Spinner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    // Save token to localStorage so the API interceptor picks it up
    localStorage.setItem("nolva_token", token);

    // Fetch user profile
    authApi
      .me()
      .then((res) => {
        const user = res.data;
        dispatch(setCredentials({ user, token }));
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "provider") router.push("/vendor-dashboard");
        else router.push("/home");
      })
      .catch(() => {
        localStorage.removeItem("nolva_token");
        setError("Impossible de récupérer votre profil. Veuillez vous reconnecter.");
      });
  }, [searchParams, dispatch, router]);

  if (error) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error}</p>
        <a href="/login" className="gi-btn-1">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="container py-5 text-center">
      <Spinner />
      <p className="mt-3">Connexion en cours...</p>
    </div>
  );
}
