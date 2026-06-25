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

const AdminMembersHistory = () => {
  const defaultEndDate = useMemo(() => todayIsoDate(), []);
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listMembersHistory({
        start_date: startDate || DEFAULT_START_DATE,
        end_date: endDate || todayIsoDate(),
        limit: 100,
      });
      const payload = res.data;
      setMembers(payload?.data?.data || payload?.data || []);
      setTotal(Number(payload?.total ?? payload?.data?.meta?.total ?? 0));
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return (
    <div className="gi-vendor-dashboard-card">
      <div className="gi-vendor-card-header d-flex flex-wrap gap-2 align-items-end justify-content-between">
        <div>
          <h5 className="mb-1">Historique des nouveaux adherents</h5>
          <p className="small text-muted mb-0">{total} compte(s) trouve(s)</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-end">
          <label className="small mb-0">
            Date de debut
            <input
              type="date"
              className="form-control form-control-sm mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="small mb-0">
            Date de fin
            <input
              type="date"
              className="form-control form-control-sm mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button type="button" className="gi-btn-2 btn-sm" onClick={loadMembers} disabled={loading}>
            {loading ? "Chargement..." : "Filtrer"}
          </button>
        </div>
      </div>

      <div className="gi-vendor-card-body table-responsive">
        <table className="table gi-vender-table">
          <thead>
            <tr>
              <th>Date inscription</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Role</th>
              <th>Ville</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Chargement...</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7}>Aucun nouvel adherent sur cette periode</td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.createdAt || member.created_at
                      ? new Date(member.createdAt || member.created_at).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td>{[member.firstName, member.lastName].filter(Boolean).join(" ") || "-"}</td>
                  <td>{member.email || "-"}</td>
                  <td>{member.phone || "-"}</td>
                  <td>{roleLabels[member.role] || member.role}</td>
                  <td>{member.city || "-"}</td>
                  <td>
                    <span className="nolva-status-badge">
                      {member.isActive ?? member.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMembersHistory;
