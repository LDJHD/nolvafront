"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api";
import { showErrorToast } from "../toast-popup/Toastify";

const DEFAULT_START_DATE = "2026-01-01";

const todayIsoDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  provider: "Prestataire",
};

const AdminUsersDirectory = () => {
  const defaultEndDate = useMemo(() => todayIsoDate(), []);
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentTotal, setRecentTotal] = useState(0);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        start_date: startDate || DEFAULT_START_DATE,
        end_date: endDate || todayIsoDate(),
        limit: 100,
      });
      const payload = res.data;
      const list = payload?.data?.data || payload?.data || [];
      setUsers(Array.isArray(list) ? list : []);
      setTotal(Number(payload?.total ?? 0));
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, startDate, endDate]);

  const loadRecentUsers = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const offset = now.getTimezoneOffset() * 60000;
      const startStr = new Date(sevenDaysAgo.getTime() - offset).toISOString().slice(0, 10);
      const endStr = todayIsoDate();

      const res = await adminApi.listUsers({
        start_date: startStr,
        end_date: endStr,
        limit: 20,
      });
      const payload = res.data;
      const list = payload?.data?.data || payload?.data || [];
      setRecentUsers(Array.isArray(list) ? list : []);
      setRecentTotal(Number(payload?.total ?? 0));
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur chargement récents");
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRecentUsers();
  }, [loadRecentUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  return (
    <div>
      {/* ── Section : Utilisateurs récents ── */}
      <div className="gi-vendor-dashboard-card mb-4">
        <div className="gi-vendor-card-header">
          <div>
            <h5 className="mb-1">Inscriptions récentes (7 derniers jours)</h5>
            <p className="small text-muted mb-0">
              {recentTotal} compte(s) récent(s)
            </p>
          </div>
        </div>
        <div className="gi-vendor-card-body table-responsive">
          <table className="table gi-vender-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Ville</th>
                <th>Entreprise</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {loadingRecent ? (
                <tr>
                  <td colSpan={8}>Chargement...</td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={8}>Aucune inscription récente</td>
                </tr>
              ) : (
                recentUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td>{formatDate(u.createdAt || u.created_at)}</td>
                    <td>
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td>{u.email || "-"}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className="nolva-status-badge">
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td>{u.city || "-"}</td>
                    <td>
                      {u.serviceProvider?.businessName || "-"}
                    </td>
                    <td>
                      {u.serviceProvider?.type || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section : Liste complète avec filtres ── */}
      <div className="gi-vendor-dashboard-card">
        <div className="gi-vendor-card-header d-flex flex-wrap gap-2 align-items-end justify-content-between">
          <div>
            <h5 className="mb-1">Tous les utilisateurs</h5>
            <p className="small text-muted mb-0">{total} compte(s) trouvé(s)</p>
          </div>
          <form
            onSubmit={handleSearch}
            className="d-flex flex-wrap gap-2 align-items-end"
          >
            {/* Recherche texte */}
            <label className="small mb-0">
              Recherche
              <input
                type="text"
                className="form-control form-control-sm mt-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, email, téléphone, ville, entreprise..."
                style={{ minWidth: 220 }}
              />
            </label>

            {/* Filtre rôle */}
            <label className="small mb-0">
              Rôle
              <select
                className="form-select form-select-sm mt-1"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: "auto" }}
              >
                <option value="">Tous</option>
                <option value="user">Utilisateur</option>
                <option value="provider">Prestataire</option>
              </select>
            </label>

            {/* Date début */}
            <label className="small mb-0">
              Date de début
              <input
                type="date"
                className="form-control form-control-sm mt-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            {/* Date fin */}
            <label className="small mb-0">
              Date de fin
              <input
                type="date"
                className="form-control form-control-sm mt-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="gi-btn-2 btn-sm"
              disabled={loading}
            >
              {loading ? "Chargement..." : "Filtrer"}
            </button>
          </form>
        </div>

        <div className="gi-vendor-card-body table-responsive">
          <table className="table gi-vender-table">
            <thead>
              <tr>
                <th>Date inscription</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Ville</th>
                <th>Entreprise</th>
                <th>Type prestataire</th>
                <th>Spécialité</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10}>Chargement...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10}>Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id}>
                    <td>{formatDate(u.createdAt || u.created_at)}</td>
                    <td>
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td>{u.email || "-"}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className="nolva-status-badge">
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td>{u.city || "-"}</td>
                    <td>{u.serviceProvider?.businessName || "-"}</td>
                    <td>{u.serviceProvider?.type || "-"}</td>
                    <td>{u.serviceProvider?.specialty || "-"}</td>
                    <td>
                      <span
                        className={`nolva-status ${
                          u.isActive ?? u.is_active ? "available" : "busy"
                        }`}
                      >
                        {u.isActive ?? u.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersDirectory;
