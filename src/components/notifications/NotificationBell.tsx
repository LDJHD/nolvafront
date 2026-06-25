"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { notificationsApi } from "@/lib/api";

type NotificationItem = {
  id: number;
  kind: string;
  title: string;
  body: string;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
  metadata?: Record<string, any> | null;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const NotificationBell = ({ mobile = false }: { mobile?: boolean }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsApi.list({ limit: 10 });
      setItems(res.data?.data || []);
      setUnread(Number(res.data?.unread || 0));
    } catch {
      setItems([]);
      setUnread(0);
    }
  };

  const notifyChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("nolva:notifications-changed"));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    timerRef.current = setInterval(load, 30000);
    window.addEventListener("nolva:notifications-changed", load);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("nolva:notifications-changed", load);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const markAllRead = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      await load();
      notifyChanged();
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (item: NotificationItem) => {
    const isUnread = !(item.readAt || item.read_at);
    setOpen(false);
    if (!isUnread) return;
    setUnread((value) => Math.max(0, value - 1));
    setItems((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, readAt: new Date().toISOString(), read_at: new Date().toISOString() }
          : notification
      )
    );
    try {
      await notificationsApi.markRead(item.id);
      notifyChanged();
    } catch {
      await load();
    }
  };

  return (
    <div className={`nolva-notification ${mobile ? "nolva-notification-mobile" : ""}`}>
      <button
        type="button"
        className="gi-header-btn nolva-notification-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <div className="header-icon">
          <i className="fi-rr-bell"></i>
        </div>
        {unread > 0 && <span className="nolva-notification-count">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="nolva-notification-panel">
          <div className="nolva-notification-head">
            <strong>Notifications</strong>
            <button type="button" onClick={markAllRead} disabled={loading || unread === 0}>
              Tout lire
            </button>
          </div>
          {items.length === 0 ? (
            <p className="nolva-notification-empty">Aucune notification pour le moment.</p>
          ) : (
            <ul>
              {items.map((item) => {
                const isUnread = !(item.readAt || item.read_at);
                const href =
                  item.metadata?.url ||
                  item.metadata?.href ||
                  (item.metadata?.quote_request_id ? `/devis/${item.metadata.quote_request_id}` : "") ||
                  (item.kind?.includes("event") ? "/user-dashboard" : "/user-dashboard");
                return (
                  <li key={item.id} className={isUnread ? "unread" : ""}>
                    <Link href={href} onClick={() => markRead(item)}>
                      <span>{item.title}</span>
                      <small>{item.body}</small>
                      <em>{formatDate(item.createdAt || item.created_at)}</em>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="nolva-notification-foot">
            <Link href="/notifications" onClick={() => setOpen(false)}>Voir toutes les notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
