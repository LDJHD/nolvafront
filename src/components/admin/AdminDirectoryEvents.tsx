"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useEventTypes, getTypeLabel } from "@/lib/useCatalog";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { Form } from "react-bootstrap";
import Link from "next/link";
import { toBooleanFlag } from "@/lib/providerDisplay";

type Sub = "validation" | "all";

const AdminDirectoryEvents = () => {
  const { types: eventTypes } = useEventTypes();
  const [sub, setSub] = useState<Sub>("validation");
  const [pending, setPending] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [approved, setApproved] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const res = await adminApi.pendingEvents();
      setPending(res.data || []);
    } catch {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const loadAll = useCallback(
    async (pageOverride?: number) => {
      const p = pageOverride ?? page;
      setLoadingAll(true);
      try {
        const res = await adminApi.listManageEvents({
          page: p,
          limit: 15,
          search: search.trim() || undefined,
          event_type: eventType || undefined,
          status: status || undefined,
          approved: approved || undefined,
        });
        setRows(normalizeList(res.data));
        setMeta((res.data as any)?.meta || null);
        if (pageOverride !== undefined) setPage(pageOverride);
      } catch {
        setRows([]);
        setMeta(null);
      } finally {
        setLoadingAll(false);
      }
    },
    [page, search, eventType, status, approved]
  );

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  useEffect(() => {
    if (sub === "all") void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub, page]);

  const orgName = (org: any) =>
    org
      ? `${org.firstName || org.first_name || ""} ${org.lastName || org.last_name || ""}`.trim() ||
        org.email ||
        "—"
      : "—";

  return (
    <div>
      <div className="btn-group mb-3" role="group">
        <button
          type="button"
          className={`btn btn-sm ${sub === "validation" ? "btn-danger" : "btn-outline-secondary"}`}
          onClick={() => setSub("validation")}
        >
          À valider {pending.length > 0 ? `(${pending.length})` : ""}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${sub === "all" ? "btn-danger" : "btn-outline-secondary"}`}
          onClick={() => setSub("all")}
        >
          Tous les événements
        </button>
      </div>

      {sub === "validation" && (
        <div className="gi-vendor-dashboard-card mb-4">
          <div className="gi-vendor-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="mb-0">Validation</h5>
            <button type="button" className="gi-btn-2 btn-sm" onClick={loadPending}>
              Actualiser
            </button>
          </div>
          <div className="gi-vendor-card-body table-responsive">
            {loadingPending ? (
              <p>Chargement...</p>
            ) : (
              <table className="table gi-vender-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Organisateur</th>
                    <th>Date</th>
                    <th>Ville</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 ? (
                    <tr>
                      <td colSpan={6}>Aucun événement en attente</td>
                    </tr>
                  ) : (
                    pending.map((ev: any) => {
                      const dateStr = ev.eventDate || ev.event_date;
                      const slug = ev.eventType || ev.event_type;
                      return (
                        <tr key={ev.id}>
                          <td>
                            <strong>{ev.title}</strong>
                          </td>
                          <td>{slug ? getTypeLabel(eventTypes, slug) : "—"}</td>
                          <td>{orgName(ev.organizer)}</td>
                          <td>{dateStr ? new Date(dateStr).toLocaleString("fr-FR") : "—"}</td>
                          <td>{ev.city || "—"}</td>
                          <td className="text-nowrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-success me-1"
                              onClick={async () => {
                                try {
                                  await adminApi.approveEvent(ev.id);
                                  showSuccessToast("Événement validé");
                                  loadPending();
                                  loadAll();
                                } catch (e: any) {
                                  showErrorToast(e.response?.data?.message || "Erreur");
                                }
                              }}
                            >
                              Valider
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setRejectTarget(ev);
                                setRejectNote("");
                              }}
                            >
                              Refuser
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {rejectTarget && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.45)" }}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Refuser l&apos;événement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectTarget(null)}
                />
              </div>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (rejectNote.trim().length < 5) {
                    showErrorToast("Indiquez un motif d'au moins 5 caractères");
                    return;
                  }
                  setRejecting(true);
                  try {
                    await adminApi.rejectEvent(rejectTarget.id, { note: rejectNote.trim() });
                    showSuccessToast("Événement refusé — organisateur notifié");
                    setRejectTarget(null);
                    loadPending();
                    loadAll();
                  } catch (err: any) {
                    showErrorToast(err.response?.data?.message || "Erreur");
                  } finally {
                    setRejecting(false);
                  }
                }}
              >
                <div className="modal-body">
                  <p className="mb-2">
                    <strong>{rejectTarget.title}</strong>
                  </p>
                  <Form.Label>Motif du refus *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Expliquez pourquoi l'événement est refusé (envoyé à l'organisateur)"
                    required
                    minLength={5}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setRejectTarget(null)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={rejecting}>
                    {rejecting ? "Envoi..." : "Confirmer le refus"}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      {sub === "all" && (
        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Recherche et filtres</h5>
          </div>
          <div className="gi-vendor-card-body">
            <div className="row g-2 align-items-end mb-3">
              <div className="col-md-3">
                <Form.Label className="small mb-0">Recherche</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="Titre, ville, lieu…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <Form.Label className="small mb-0">Type</Form.Label>
                <Form.Select size="sm" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <option value="">Tous</option>
                  {eventTypes.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-2">
                <Form.Label className="small mb-0">Statut</Form.Label>
                <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="upcoming">À venir</option>
                  <option value="ongoing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </Form.Select>
              </div>
              <div className="col-md-2">
                <Form.Label className="small mb-0">Publication</Form.Label>
                <Form.Select size="sm" value={approved} onChange={(e) => setApproved(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="true">Validés</option>
                  <option value="false">Non validés</option>
                </Form.Select>
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button
                  type="button"
                  className="gi-btn-1 btn-sm"
                  onClick={() => {
                    void loadAll(1);
                  }}
                >
                  Filtrer
                </button>
                <button
                  type="button"
                  className="gi-btn-2 btn-sm"
                  onClick={() => {
                    setSearch("");
                    setEventType("");
                    setStatus("");
                    setApproved("");
                    setPage(1);
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="table-responsive">
              {loadingAll ? (
                <p>Chargement...</p>
              ) : (
                <table className="table gi-vender-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Validé</th>
                      <th>Statut</th>
                      <th>Avant</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8}>Aucun résultat</td>
                      </tr>
                    ) : (
                      rows.map((ev: any) => {
                        const dateStr = ev.eventDate || ev.event_date;
                        const slug = ev.eventType || ev.event_type;
                        const ok = toBooleanFlag(ev.isApproved ?? ev.is_approved);
                        const featured = toBooleanFlag(ev.isFeatured ?? ev.is_featured);
                        return (
                          <tr key={ev.id}>
                            <td>{ev.id}</td>
                            <td>
                              <strong>{ev.title}</strong>
                              {ok && (
                                <div>
                                  <Link href={`/evenements/${ev.id}`} className="small">
                                    Voir page publique
                                  </Link>
                                </div>
                              )}
                            </td>
                            <td>{slug ? getTypeLabel(eventTypes, slug) : "—"}</td>
                            <td>{ok ? "Oui" : "Non"}</td>
                            <td>{ev.status}</td>
                            <td>{featured ? "Oui" : "Non"}</td>
                            <td>{dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "—"}</td>
                            <td className="text-nowrap">
                              {!ok && ev.status !== "cancelled" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success me-1"
                                    onClick={async () => {
                                      try {
                                        await adminApi.approveEvent(ev.id);
                                        showSuccessToast("Validé");
                                        loadAll();
                                        loadPending();
                                      } catch (e: any) {
                                        showErrorToast(e.response?.data?.message || "Erreur");
                                      }
                                    }}
                                  >
                                    Valider
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger me-1"
                                    onClick={async () => {
                                      const note = window.prompt("Refus ?") || "";
                                      try {
                                        await adminApi.rejectEvent(ev.id, { note });
                                        showSuccessToast("Refusé");
                                        loadAll();
                                        loadPending();
                                      } catch (e: any) {
                                        showErrorToast(e.response?.data?.message || "Erreur");
                                      }
                                    }}
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                              {ok && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning me-1"
                                  onClick={async () => {
                                    if (!window.confirm("Masquer de la liste publique ?")) return;
                                    try {
                                      await adminApi.updateManageEvent(ev.id, { is_public: false });
                                      showSuccessToast("Événement masqué du public");
                                      loadAll();
                                    } catch (e: any) {
                                      showErrorToast(e.response?.data?.message || "Erreur");
                                    }
                                  }}
                                >
                                  Masquer
                                </button>
                              )}
                              {ok && (
                                <button
                                  type="button"
                                  className={`btn btn-sm ${featured ? "btn-outline-secondary" : "btn-outline-danger"} me-1`}
                                  onClick={async () => {
                                    try {
                                      await adminApi.updateManageEvent(ev.id, {
                                        is_featured: !featured,
                                        featured_order: featured ? 0 : 100,
                                      });
                                      showSuccessToast(featured ? "Mise en avant retiree" : "Evenement mis en avant");
                                      loadAll();
                                    } catch (e: any) {
                                      showErrorToast(e.response?.data?.message || "Erreur");
                                    }
                                  }}
                                >
                                  {featured ? "Retirer avant" : "Mettre avant"}
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={async () => {
                                  if (!window.confirm("Marquer comme annulé ?")) return;
                                  try {
                                    await adminApi.updateManageEvent(ev.id, { status: "cancelled" });
                                    showSuccessToast("Statut mis à jour");
                                    loadAll();
                                    loadPending();
                                  } catch (e: any) {
                                    showErrorToast(e.response?.data?.message || "Erreur");
                                  }
                                }}
                              >
                                Annuler
                              </button>
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
                    onClick={() => void loadAll(page - 1)}
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={page >= (meta.last_page || 1)}
                    onClick={() => void loadAll(page + 1)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDirectoryEvents;
