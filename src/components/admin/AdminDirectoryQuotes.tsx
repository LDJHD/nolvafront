"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useEventTypes, getTypeLabel } from "@/lib/useCatalog";
import { getProviderLabel } from "@/lib/providerUtils";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { Form } from "react-bootstrap";

const quoteStatusLabels: Record<string, string> = {
  pending: "En attente",
  negotiating: "Discussion",
  accepted: "Validée (attente paiement)",
  paid: "Payée",
  declined: "Refusée",
  completed: "Terminée",
  cancelled: "Annulée",
};

const AdminDirectoryQuotes = () => {
  const { types: eventTypes } = useEventTypes();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (pageOverride?: number) => {
      const p = pageOverride ?? page;
      setLoading(true);
      try {
        const res = await adminApi.listManageQuoteRequests({
          page: p,
          limit: 15,
          search: search.trim() || undefined,
          status: status || undefined,
          event_type: eventType || undefined,
        });
        setRows(normalizeList(res.data));
        setMeta((res.data as any)?.meta || null);
        if (pageOverride !== undefined) setPage(pageOverride);
      } catch {
        setRows([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [page, search, status, eventType]
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const setStatusRow = async (id: number, newStatus: string) => {
    try {
      await adminApi.updateManageQuoteRequest(id, { status: newStatus });
      showSuccessToast("Demande mise à jour");
      void load(page);
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    }
  };

  const clientName = (u: any) =>
    u
      ? `${u.firstName || u.first_name || ""} ${u.lastName || u.last_name || ""}`.trim() ||
        u.email ||
        "—"
      : "—";

  return (
    <div className="gi-vendor-dashboard-card">
      <div className="gi-vendor-card-header">
        <h5 className="mb-0">Demandes de devis</h5>
        <p className="small text-muted mb-0 mt-1">
          Suivi global : le prestataire traite habituellement la demande ; l&apos;admin peut corriger le
          statut (litige, erreur, clôture).
        </p>
      </div>
      <div className="gi-vendor-card-body">
        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-4">
            <Form.Label className="small mb-0">Recherche</Form.Label>
            <Form.Control
              size="sm"
              placeholder="Message, lieu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <Form.Label className="small mb-0">Statut</Form.Label>
            <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous</option>
              {Object.entries(quoteStatusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Label className="small mb-0">Type événement</Form.Label>
            <Form.Select size="sm" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="">Tous</option>
              {eventTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button type="button" className="gi-btn-1 btn-sm" onClick={() => void load(1)}>
              Filtrer
            </button>
            <button
              type="button"
              className="gi-btn-2 btn-sm"
              onClick={() => {
                setSearch("");
                setStatus("");
                setEventType("");
                void load(1);
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table className="table gi-vender-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Prestataire</th>
                  <th>Type événement</th>
                  <th>Statut</th>
                  <th>Date événement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Aucune demande</td>
                  </tr>
                ) : (
                  rows.map((q: any) => {
                    const prov = q.provider;
                    const slug = q.eventType || q.event_type;
                    const ed = q.eventDate || q.event_date;
                    const st = q.status;
                    return (
                      <tr key={q.id}>
                        <td>{q.id}</td>
                        <td>{clientName(q.user)}</td>
                        <td>{prov ? getProviderLabel(prov) : "—"}</td>
                        <td>{slug ? getTypeLabel(eventTypes, slug) : "—"}</td>
                        <td>{quoteStatusLabels[st] || st}</td>
                        <td>{ed ? new Date(ed).toLocaleDateString("fr-FR") : "—"}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            style={{ minWidth: "140px" }}
                            value={st}
                            onChange={(e) => setStatusRow(q.id, e.target.value)}
                          >
                            {Object.entries(quoteStatusLabels).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        {meta && meta.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="small text-muted">
              Page {meta.current_page} / {meta.last_page}
            </span>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
              >
                Précédent
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={page >= (meta.last_page || 1)}
                onClick={() => void load(page + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDirectoryQuotes;
