"use client";

import { useEffect, useState } from "react";
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

const notificationHref = (item: NotificationItem) =>
  item.metadata?.url ||
  item.metadata?.href ||
  (item.metadata?.quote_request_id ? `/devis/${item.metadata.quote_request_id}` : "/user-dashboard");

const formatDate = (value?: string) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const NotificationsPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationsApi.list({ limit: 30 });
      setItems(res.data?.data || []);
      setUnread(Number(res.data?.unread || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isAuthenticated]);

  const notifyChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("nolva:notifications-changed"));
    }
  };

  const markRead = async (item: NotificationItem) => {
    const isUnread = !(item.readAt || item.read_at);
    if (!isUnread) return;
    const now = new Date().toISOString();
    setItems((current) =>
      current.map((notification) =>
        notification.id === item.id ? { ...notification, readAt: now, read_at: now } : notification
      )
    );
    setUnread((value) => Math.max(0, value - 1));
    try {
      await notificationsApi.markRead(item.id);
      notifyChanged();
    } catch {
      await load();
    }
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    await load();
    notifyChanged();
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <p>Connectez-vous pour lire vos notifications.</p>
        <Link href="/login" className="gi-btn-1">Se connecter</Link>
      </div>
    );
  }

  return (
    <section className="padding-tb-40">
      <div className="container">
        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-0">Notifications</h5>
              <small className="text-muted">{unread} non lue(s)</small>
            </div>
            <button type="button" className="gi-btn-2 btn-sm" onClick={markAllRead} disabled={unread === 0}>
              Tout marquer comme lu
            </button>
          </div>
          <div className="gi-vendor-card-body">
            {loading ? (
              <p>Chargement...</p>
            ) : items.length === 0 ? (
              <p className="text-muted mb-0">Aucune notification pour le moment.</p>
            ) : (
              <div className="nolva-notification-list">
                {items.map((item) => {
                  const isUnread = !(item.readAt || item.read_at);
                  return (
                    <div key={item.id} className={`nolva-notification-row ${isUnread ? "unread" : ""}`}>
                      <Link href={notificationHref(item)} onClick={() => markRead(item)}>
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                        <em>{formatDate(item.createdAt || item.created_at)}</em>
                      </Link>
                      {isUnread && (
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => markRead(item)}>
                          Marquer lu
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
