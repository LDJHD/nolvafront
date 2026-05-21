"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { Col, Form, Row } from "react-bootstrap";

type CatalogItem = {
  id: number;
  slug: string;
  label: string;
  isActive?: boolean;
  is_active?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

const AdminCatalogTab = () => {
  const [eventTypes, setEventTypes] = useState<CatalogItem[]>([]);
  const [providerTypes, setProviderTypes] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEventLabel, setNewEventLabel] = useState("");
  const [newProviderLabel, setNewProviderLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, pr] = await Promise.all([
        adminApi.listEventTypes(),
        adminApi.listProviderTypes(),
      ]);
      setEventTypes(ev.data || []);
      setProviderTypes(pr.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventLabel.trim()) return;
    try {
      await adminApi.createEventType({ label: newEventLabel.trim() });
      showSuccessToast("Type d'événement ajouté");
      setNewEventLabel("");
      load();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderLabel.trim()) return;
    try {
      await adminApi.createProviderType({ label: newProviderLabel.trim() });
      showSuccessToast("Type de prestataire ajouté");
      setNewProviderLabel("");
      load();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const toggleEvent = async (item: CatalogItem) => {
    const active = item.isActive ?? item.is_active ?? true;
    try {
      await adminApi.updateEventType(item.id, { is_active: !active });
      load();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const toggleProvider = async (item: CatalogItem) => {
    const active = item.isActive ?? item.is_active ?? true;
    try {
      await adminApi.updateProviderType(item.id, { is_active: !active });
      load();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  if (loading) return <p>Chargement du catalogue...</p>;

  return (
    <Row>
      <Col lg={6} className="mb-4">
        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Types d&apos;événements</h5>
          </div>
          <div className="gi-vendor-card-body">
            <Form onSubmit={handleCreateEvent} className="d-flex gap-2 mb-3">
              <Form.Control
                placeholder="Nouveau type (ex: Barbecue party)"
                value={newEventLabel}
                onChange={(e) => setNewEventLabel(e.target.value)}
                required
              />
              <button type="submit" className="gi-btn-1 btn-sm text-nowrap">
                Ajouter
              </button>
            </Form>
            <div className="table-responsive">
              <table className="table table-sm gi-vender-table">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Slug</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {eventTypes.map((t) => {
                    const active = t.isActive ?? t.is_active ?? true;
                    return (
                      <tr key={t.id}>
                        <td>{t.label}</td>
                        <td style={{ fontSize: "11px" }}>{t.slug}</td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm ${active ? "btn-success" : "btn-secondary"}`}
                            onClick={() => toggleEvent(t)}
                          >
                            {active ? "Actif" : "Inactif"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Col>
      <Col lg={6} className="mb-4">
        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Types de prestataires</h5>
          </div>
          <div className="gi-vendor-card-body">
            <Form onSubmit={handleCreateProvider} className="d-flex gap-2 mb-3">
              <Form.Control
                placeholder="Nouveau type (ex: Maquilleur)"
                value={newProviderLabel}
                onChange={(e) => setNewProviderLabel(e.target.value)}
                required
              />
              <button type="submit" className="gi-btn-1 btn-sm text-nowrap">
                Ajouter
              </button>
            </Form>
            <div className="table-responsive">
              <table className="table table-sm gi-vender-table">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Slug</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {providerTypes.map((t) => {
                    const active = t.isActive ?? t.is_active ?? true;
                    return (
                      <tr key={t.id}>
                        <td>{t.label}</td>
                        <td style={{ fontSize: "11px" }}>{t.slug}</td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm ${active ? "btn-success" : "btn-secondary"}`}
                            onClick={() => toggleProvider(t)}
                          >
                            {active ? "Actif" : "Inactif"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default AdminCatalogTab;
