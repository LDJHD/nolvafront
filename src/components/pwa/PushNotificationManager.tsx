"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getBackendUrl } from "@/lib/apiConfig";

const PushNotificationManager = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager
        .getSubscription()
        .then((sub) => setSubscribed(!!sub))
        .catch(() => setSubscribed(false));
    });
  }, []);

  const authHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const subscribe = async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const backend = getBackendUrl();

      const data = await fetch(`${backend}/api/push/vapid-public-key`).then((r) => r.json());
      if (!data?.publicKey) throw new Error("Clé VAPID indisponible");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      await fetch(`${backend}/api/push/subscribe`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      setSubscribed(true);
    } catch (e) {
      console.error("Push subscription failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch(`${getBackendUrl()}/api/push/unsubscribe`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
    } catch (e) {
      console.error("Push unsubscribe failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="nolva-push-manager">
      <button
        type="button"
        className={`nolva-push-btn ${subscribed ? "subscribed" : ""}`}
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
      >
        <i className={subscribed ? "fi fi-rr-bell" : "fi fi-rr-bell-slash"}></i>
        {loading ? "..." : subscribed ? "Notifications activées" : "Activer les notifications"}
      </button>
    </div>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default PushNotificationManager;
