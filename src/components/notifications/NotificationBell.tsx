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

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    timerRef.current = setInterval(load, 30000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const markAllRead = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      await load();
    } finally {
      setLoading(false);
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
                  (item.kind?.includes("event") ? "/user-dashboard" : "/user-dashboard");
                return (
                  <li key={item.id} className={isUnread ? "unread" : ""}>
                    <Link href={href} onClick={() => setOpen(false)}>
                      <span>{item.title}</span>
                      <small>{item.body}</small>
                      <em>{formatDate(item.createdAt || item.created_at)}</em>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
