"use client";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";

const PushNotificationManager = () => {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    // Check existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const publicKey = await fetch("/api/push/vapid-public-key").then((r) => r.json()).then((d) => d.publicKey).catch(() => null);

      // Fetch from backend
      const res = await fetch("http://localhost:3333/api/push/vapid-public-key");
      const data = await res.json();
      const vapidKey = data.publicKey;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("http://localhost:3333/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        await fetch("http://localhost:3333/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
