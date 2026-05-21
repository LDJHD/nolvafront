"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";
import { useProviderTypes } from "@/lib/useCatalog";
import { getProviderLabel, getProviderTypeLabel } from "@/lib/providerUtils";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { Form } from "react-bootstrap";
import Link from "next/link";

const AdminDirectoryProviders = () => {
  const { types: providerTypes } = useProviderTypes();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (pageOverride?: number) => {
      const p = pageOverride ?? page;
      setLoading(true);
      try {
        const res = await adminApi.listManageProviders({
          page: p,
          limit: 15,
          search: search.trim() || undefined,
          type: type || undefined,
          status: status || undefined,
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
    [page, search, type, status]
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recherche via « Filtrer »
  }, [page]);

  const updateRow = async (id: number, payload: Record<string, unknown>) => {
    try {
      await adminApi.updateManageProvider(id, payload);
      showSuccessToast("Prestataire mis à jour");
      void load(page);
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="gi-vendor-dashboard-card">
      <div className="gi-vendor-card-header">
        <h5 className="mb-0">Tous les prestataires</h5>
      </div>
      <div className="gi-vendor-card-body">
        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-4">
            <Form.Label className="small mb-0">Recherche</Form.Label>
            <Form.Control
              size="sm"
              placeholder="Nom commercial, e-mail client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <Form.Label className="small mb-0">Type</Form.Label>
            <Form.Select size="sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous</option>
              {providerTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Label className="small mb-0">Statut compte</Form.Label>
            <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="inactive">Inactif</option>
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
                setType("");
                setStatus("");
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
                  <th>Activité</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Vérifié</th>
                  <th>Disponible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Aucun prestataire</td>
                  </tr>
                ) : (
                  rows.map((p: any) => {
                    const st = p.status;
                    const ver = p.isVerified ?? p.is_verified;
                    const av = p.isAvailable ?? p.is_available;
                    const catalog = providerTypes.map((t) => ({ slug: t.slug, label: t.label }));
                    return (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>
                          <strong>{getProviderLabel(p)}</strong>
                          <div>
                            <Link href={`/prestataires/${p.id}`} className="small" target="_blank">
                              Fiche publique
                            </Link>
                          </div>
                        </td>
                        <td>{getProviderTypeLabel(p, catalog)}</td>
                        <td>{st}</td>
                        <td>{ver ? "Oui" : "Non"}</td>
                        <td>{av ? "Oui" : "Non"}</td>
                        <td className="text-nowrap">
                          {st !== "active" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success me-1"
                              onClick={() => updateRow(p.id, { status: "active" })}
                            >
                              Activer
                            </button>
                          )}
                          {st === "active" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning me-1"
                              onClick={() => updateRow(p.id, { status: "inactive" })}
                            >
                              Désactiver
                            </button>
                          )}
                          {!ver && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => updateRow(p.id, { is_verified: true })}
                            >
                              Vérifier
                            </button>
                          )}
                          {ver && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary me-1"
                              onClick={() => updateRow(p.id, { is_verified: false })}
                            >
                              Retirer vérif.
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => updateRow(p.id, { is_available: !av })}
                          >
                            {av ? "Indispo" : "Dispo"}
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

export default AdminDirectoryProviders;
