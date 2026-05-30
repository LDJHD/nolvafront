"use client";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import AdminCatalogTab from "./AdminCatalogTab";
import AdminDirectoryEvents from "./AdminDirectoryEvents";
import AdminDirectoryProviders from "./AdminDirectoryProviders";
import AdminDirectoryQuotes from "./AdminDirectoryQuotes";
import AdminQuoteActivities from "./AdminQuoteActivities";
import AdminPayoutsPanel from "./AdminPayoutsPanel";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { Col, Form, Row } from "react-bootstrap";
import { PAYOUT_METHOD_OPTIONS, payoutDestinationHint } from "@/lib/payoutMethods";

type Tab =
  | "overview"
  | "transactions"
  | "disputes"
  | "commissions"
  | "payouts"
  | "events"
  | "providers"
  | "quotes"
  | "catalog";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  paid: "Payé (séquestre)",
  released: "Libéré",
  disputed: "Litige",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

const AdminDashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [resolveRef, setResolveRef] = useState("");
  const [resolveAction, setResolveAction] = useState<"release" | "refund" | "split">("release");
  const [resolveNote, setResolveNote] = useState("");
  const [splitPct, setSplitPct] = useState(50);
  const [newCommission, setNewCommission] = useState({
    label: "",
    target_type: "ticket",
    target_value: "",
    rate: 12,
  });
  const [editingCommission, setEditingCommission] = useState<any | null>(null);
  const [editRate, setEditRate] = useState(0);
  const [freezeRef, setFreezeRef] = useState<string | null>(null);
  const [freezeNote, setFreezeNote] = useState("");
  const [freezing, setFreezing] = useState(false);
  const [repayMode, setRepayMode] = useState<"collect_client" | "payout_provider">("payout_provider");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMethod, setRepayMethod] = useState("bj_mtn");
  const [repayDestination, setRepayDestination] = useState("");
  const [repaying, setRepaying] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("bj_mtn");
  const [refundDestination, setRefundDestination] = useState("");
  const [contactingOrganizer, setContactingOrganizer] = useState(false);
  const [refundingClient, setRefundingClient] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, txRes, commRes, payRes] = await Promise.allSettled([
        adminApi.commissionStats(),
        adminApi.transactions({ status: statusFilter || undefined, limit: 50 }),
        adminApi.listCommissions(),
        adminApi.payouts({ limit: 30 }),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (txRes.status === "fulfilled") {
        const d = txRes.value.data;
        setTransactions(d?.data || d || []);
      }
      if (commRes.status === "fulfilled") setCommissions(commRes.value.data || []);
      if (payRes.status === "fulfilled") {
        const d = payRes.value.data;
        setPayouts(d?.data || d || []);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user?.role, loadData]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container py-5 text-center">
        <p>Accès réservé aux administrateurs NOLVA.</p>
        <Link href="/login" className="gi-btn-1">Se connecter</Link>
      </div>
    );
  }

  const disputed = transactions.filter((t) => t.status === "disputed");
  const selectedDispute = disputed.find((t) => t.reference === resolveRef);
  const formatMoney = (n: number) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

  const submitFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freezeRef || freezeNote.trim().length < 5) {
      showErrorToast("Motif requis (5 caractères minimum)");
      return;
    }
    setFreezing(true);
    try {
      await adminApi.freezeTransaction({ transaction_ref: freezeRef, note: freezeNote.trim() });
      showSuccessToast("Paiement gelé — client et prestataire notifiés");
      setFreezeRef(null);
      setFreezeNote("");
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    } finally {
      setFreezing(false);
    }
  };

  const submitDisputeRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveRef || !repayAmount) return;
    setRepaying(true);
    try {
      const res = await adminApi.disputeRepayment({
        transaction_ref: resolveRef,
        amount: Number(repayAmount),
        mode: repayMode,
        payout_method: repayMode === "payout_provider" ? repayMethod : undefined,
        payout_destination:
          repayMode === "payout_provider" ? repayDestination.trim() : undefined,
        note: resolveNote || undefined,
      });
      showSuccessToast(res.data?.message || "Opération FedaPay lancée");
      if (res.data?.paymentUrl) {
        window.open(res.data.paymentUrl, "_blank");
      }
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    } finally {
      setRepaying(false);
    }
  };

  const contactRefundOrganizer = async () => {
    if (!resolveRef) return;
    setContactingOrganizer(true);
    try {
      await adminApi.contactRefundOrganizer({
        transaction_ref: resolveRef,
        note: resolveNote || undefined,
      });
      showSuccessToast("Organisateur notifie pour confirmation");
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    } finally {
      setContactingOrganizer(false);
    }
  };

  const submitClientRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveRef || !refundDestination.trim()) return;
    setRefundingClient(true);
    try {
      await adminApi.refundClient({
        transaction_ref: resolveRef,
        amount: refundAmount ? Number(refundAmount) : undefined,
        payout_method: refundMethod,
        payout_destination: refundDestination.trim(),
        note: resolveNote || undefined,
      });
      showSuccessToast("Remboursement envoye au client");
      setResolveRef("");
      setRefundAmount("");
      setRefundDestination("");
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    } finally {
      setRefundingClient(false);
    }
  };

  const saveCommissionEdit = async () => {
    if (!editingCommission) return;
    try {
      await adminApi.updateCommission(editingCommission.id, { rate: editRate });
      showSuccessToast("Taux mis à jour");
      setEditingCommission(null);
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const removeCommission = async (c: any) => {
    if (c.is_default || c.isDefault) {
      showErrorToast("Les taux par défaut (billets / prestations) se modifient, pas se suppriment.");
      return;
    }
    if (!window.confirm(`Supprimer la commission « ${c.label} » ?`)) return;
    try {
      await adminApi.deleteCommission(c.id);
      showSuccessToast("Commission supprimée");
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveRef) return;
    try {
      await adminApi.resolveDispute({
        transaction_ref: resolveRef,
        action: resolveAction,
        split_percentage: resolveAction === "split" ? splitPct : undefined,
        note: resolveNote,
      });
      showSuccessToast("Litige résolu");
      setResolveRef("");
      setResolveNote("");
      setRefundAmount("");
      setRefundDestination("");
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCommission({
        label: newCommission.label,
        target_type: newCommission.target_type,
        target_value: newCommission.target_value || undefined,
        rate: newCommission.rate,
      });
      showSuccessToast("Commission créée");
      setNewCommission({ label: "", target_type: "ticket", target_value: "", rate: 12 });
      loadData();
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <section className="gi-vendor-dashboard padding-tb-40">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 style={{ margin: 0 }}>Administration NOLVA</h2>
            <p style={{ color: "#666", margin: 0 }}>Bonjour {user?.firstName}</p>
          </div>
          <Link href="/home" className="gi-btn-2">Retour au site</Link>
        </div>

        <ul className="nav nav-tabs mb-4 flex-wrap">
          {(
            [
              ["overview", "Vue d'ensemble"],
              ["transactions", "Transactions"],
              ["disputes", "Litiges"],
              ["commissions", "Commissions"],
              ["payouts", "Reversements"],
              ["events", "Événements"],
              ["providers", "Prestataires"],
              ["quotes", "Devis"],
              ["catalog", "Catalogue"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <li className="nav-item" key={id}>
              <button
                type="button"
                className={`nav-link ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
                {id === "disputes" && disputed.length > 0 && (
                  <span className="badge bg-danger ms-1">{disputed.length}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {loading && tab === "overview" ? (
          <p>Chargement...</p>
        ) : (
          <>
            {tab === "overview" && (
              <Row>
                <Col md={4} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Volume total</h5>
                    <h3 style={{ color: "#E31E24" }}>{formatMoney(stats?.total_volume || 0)}</h3>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Commissions NOLVA</h5>
                    <h3>{formatMoney(stats?.total_commissions || 0)}</h3>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Transactions</h5>
                    <h3>{stats?.total_transactions ?? transactions.length}</h3>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="gi-vendor-dashboard-card p-4">
                    <h5>Paiements sécurisés FedaPay</h5>
                    <p style={{ color: "#666", marginBottom: "12px" }}>
                      Escrow : fonds bloqués jusqu&apos;à validation (24h prestataire / 48h après
                      événement).
                    </p>
                    <button
                      type="button"
                      className="gi-btn-2 btn-sm"
                      onClick={async () => {
                        try {
                          const res = await adminApi.runEscrowRelease();
                          showSuccessToast(
                            `Libérations : ${res.data.tickets} billet(s), ${res.data.providers} prestation(s)`
                          );
                          loadData();
                        } catch (e: any) {
                          showErrorToast(e.response?.data?.message || "Erreur");
                        }
                      }}
                    >
                      Exécuter les libérations automatiques
                    </button>
                  </div>
                </Col>
              </Row>
            )}

            {tab === "transactions" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header d-flex flex-wrap gap-2 align-items-center">
                  <h5 className="mb-0">Toutes les transactions</h5>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous statuts</option>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button type="button" className="gi-btn-2 btn-sm" onClick={loadData}>
                    Actualiser
                  </button>
                </div>
                <div className="gi-vendor-card-body table-responsive">
                  <table className="table gi-vender-table">
                    <thead>
                      <tr>
                        <th>Réf.</th>
                        <th>Type</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Commission</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={7}>Aucune transaction</td></tr>
                      ) : (
                        transactions.map((t: any) => (
                          <tr key={t.id}>
                            <td style={{ fontSize: "11px" }}>{t.reference}</td>
                            <td>{t.type === "ticket_purchase" ? "Billet" : "Prestation"}</td>
                            <td>{t.user?.firstName} {t.user?.lastName}</td>
                            <td>{formatMoney(t.amount)}</td>
                            <td>{formatMoney(t.commission_amount ?? t.commissionAmount)}</td>
                            <td>
                              <span className="nolva-status-badge">
                                {statusLabels[t.status] || t.status}
                              </span>
                            </td>
                            <td>
                              {t.status === "paid" && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => {
                                    setFreezeRef(t.reference);
                                    setFreezeNote("");
                                  }}
                                >
                                  Geler
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "disputes" && (
              <Row>
                <Col lg={7}>
                  <div className="gi-vendor-dashboard-card mb-4">
                    <div className="gi-vendor-card-header"><h5>Litiges en cours</h5></div>
                    <div className="gi-vendor-card-body table-responsive">
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Réf.</th>
                            <th>Raison</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disputed.length === 0 ? (
                            <tr><td colSpan={3}>Aucun litige</td></tr>
                          ) : (
                            disputed.map((t: any) => (
                              <tr
                                key={t.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setResolveRef(t.reference);
                                  setRefundAmount(String(t.amount || ""));
                                }}
                              >
                                <td>{t.reference}</td>
                                <td>{t.dispute_reason || t.disputeReason || "-"}</td>
                                <td>
                                  {t.disputed_at
                                    ? new Date(t.disputed_at).toLocaleDateString("fr-FR")
                                    : "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Col>
                <Col lg={5}>
                  <div className="gi-vendor-dashboard-card">
                    <div className="gi-vendor-card-header"><h5>Résoudre un litige</h5></div>
                    <div className="gi-vendor-card-body">
                      <Form onSubmit={handleResolve}>
                        <Form.Group className="mb-2">
                          <Form.Label>Référence transaction</Form.Label>
                          <Form.Control
                            value={resolveRef}
                            onChange={(e) => setResolveRef(e.target.value)}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Action</Form.Label>
                          <Form.Select
                            value={resolveAction}
                            onChange={(e) =>
                              setResolveAction(e.target.value as typeof resolveAction)
                            }
                          >
                            <option value="release">Libérer au bénéficiaire</option>
                            <option value="refund">Rembourser le client</option>
                            <option value="split">Partager le montant</option>
                          </Form.Select>
                        </Form.Group>
                        {resolveAction === "split" && (
                          <Form.Group className="mb-2">
                            <Form.Label>% au prestataire</Form.Label>
                            <Form.Control
                              type="number"
                              min={0}
                              max={100}
                              value={splitPct}
                              onChange={(e) => setSplitPct(Number(e.target.value))}
                            />
                          </Form.Group>
                        )}
                        <Form.Group className="mb-2">
                          <Form.Label>Note admin</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={resolveNote}
                            onChange={(e) => setResolveNote(e.target.value)}
                          />
                        </Form.Group>
                        {selectedDispute?.type === "ticket_purchase" && (
                          <div className="alert alert-warning py-2 small mb-2">
                            Avant remboursement, l&apos;admin peut demander confirmation a
                            l&apos;organisateur que le client avait bien paye.
                          </div>
                        )}
                        {selectedDispute?.type === "ticket_purchase" && (
                          <button
                            type="button"
                            className="btn btn-outline-primary w-100 mb-2"
                            disabled={contactingOrganizer || !resolveRef}
                            onClick={contactRefundOrganizer}
                          >
                            {contactingOrganizer
                              ? "Envoi..."
                              : "Ecrire a l'organisateur pour confirmation"}
                          </button>
                        )}
                        <button type="submit" className="gi-btn-1 w-100 mb-3">
                          Appliquer la décision
                        </button>
                      </Form>
                      <hr />
                      <h6 className="fw-semibold">Remboursement client</h6>
                      <p className="small text-muted">
                        Apres validation admin, ce bouton verifie le paiement et envoie le
                        remboursement via FedaPay.
                      </p>
                      <Form onSubmit={submitClientRefund} className="mb-3">
                        <Form.Group className="mb-2">
                          <Form.Label>Montant a rembourser (FCFA)</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            step={1}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder={selectedDispute ? String(selectedDispute.amount || "") : ""}
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Mode de remboursement</Form.Label>
                          <Form.Select
                            value={refundMethod}
                            onChange={(e) => setRefundMethod(e.target.value)}
                          >
                            {PAYOUT_METHOD_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Coordonnees client</Form.Label>
                          <Form.Control
                            value={refundDestination}
                            onChange={(e) => setRefundDestination(e.target.value)}
                            placeholder={payoutDestinationHint(refundMethod)}
                            required
                          />
                        </Form.Group>
                        <button
                          type="submit"
                          className="btn btn-danger w-100"
                          disabled={refundingClient || !resolveRef}
                        >
                          {refundingClient ? "Remboursement..." : "Valider et rembourser via FedaPay"}
                        </button>
                      </Form>
                      <hr />
                      <h6 className="fw-semibold">Paiement FedaPay après litige</h6>
                      <p className="small text-muted">
                        Choisissez librement le montant et le moyen (encaisser le client ou payer le
                        prestataire).
                      </p>
                      <Form onSubmit={submitDisputeRepayment}>
                        <Form.Group className="mb-2">
                          <Form.Label>Montant (FCFA)</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            step={1}
                            value={repayAmount}
                            onChange={(e) => setRepayAmount(e.target.value)}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Opération</Form.Label>
                          <Form.Select
                            value={repayMode}
                            onChange={(e) =>
                              setRepayMode(e.target.value as typeof repayMode)
                            }
                          >
                            <option value="payout_provider">Payer le prestataire (reversement)</option>
                            <option value="collect_client">Faire payer le client (lien FedaPay)</option>
                          </Form.Select>
                        </Form.Group>
                        {repayMode === "payout_provider" && (
                          <>
                            <Form.Group className="mb-2">
                              <Form.Label>Mode de versement</Form.Label>
                              <Form.Select
                                value={repayMethod}
                                onChange={(e) => setRepayMethod(e.target.value)}
                              >
                                {PAYOUT_METHOD_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Label>Coordonnées</Form.Label>
                              <Form.Control
                                value={repayDestination}
                                onChange={(e) => setRepayDestination(e.target.value)}
                                placeholder={payoutDestinationHint(repayMethod)}
                                required
                              />
                            </Form.Group>
                          </>
                        )}
                        <button type="submit" className="gi-btn-2 w-100" disabled={repaying || !resolveRef}>
                          {repaying ? "Traitement..." : "Lancer via FedaPay"}
                        </button>
                      </Form>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {tab === "commissions" && (
              <Row>
                <Col lg={7}>
                  <div className="gi-vendor-dashboard-card">
                    <div className="gi-vendor-card-header"><h5>Taux de commission</h5></div>
                    <div className="gi-vendor-card-body table-responsive">
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Libellé</th>
                            <th>Type</th>
                            <th>Cible</th>
                            <th>Taux</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map((c: any) => (
                            <tr key={c.id}>
                              <td>{c.label}</td>
                              <td>{c.target_type || c.targetType}</td>
                              <td>{c.target_value || c.targetValue || "Défaut"}</td>
                              <td>
                                {editingCommission?.id === c.id ? (
                                  <Form.Control
                                    type="number"
                                    min={0}
                                    max={100}
                                    className="form-control-sm"
                                    style={{ width: 80 }}
                                    value={editRate}
                                    onChange={(e) => setEditRate(Number(e.target.value))}
                                  />
                                ) : (
                                  `${c.rate}%`
                                )}
                              </td>
                              <td className="text-nowrap">
                                {editingCommission?.id === c.id ? (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success me-1"
                                      onClick={saveCommissionEdit}
                                    >
                                      OK
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => setEditingCommission(null)}
                                    >
                                      Annuler
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary me-1"
                                      onClick={() => {
                                        setEditingCommission(c);
                                        setEditRate(Number(c.rate));
                                      }}
                                    >
                                      Modifier
                                    </button>
                                    {!(c.is_default || c.isDefault) && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeCommission(c)}
                                      >
                                        Supprimer
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Col>
                <Col lg={5}>
                  <div className="gi-vendor-dashboard-card">
                    <div className="gi-vendor-card-header"><h5>Nouvelle commission</h5></div>
                    <div className="gi-vendor-card-body">
                      <Form onSubmit={handleCreateCommission}>
                        <Form.Group className="mb-2">
                          <Form.Label>Libellé</Form.Label>
                          <Form.Control
                            value={newCommission.label}
                            onChange={(e) =>
                              setNewCommission({ ...newCommission, label: e.target.value })
                            }
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Type</Form.Label>
                          <Form.Select
                            value={newCommission.target_type}
                            onChange={(e) =>
                              setNewCommission({ ...newCommission, target_type: e.target.value })
                            }
                          >
                            <option value="ticket">Billet</option>
                            <option value="provider">Prestataire</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Valeur cible (optionnel)</Form.Label>
                          <Form.Control
                            placeholder="ex: dj"
                            value={newCommission.target_value}
                            onChange={(e) =>
                              setNewCommission({ ...newCommission, target_value: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Taux (%)</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            max={100}
                            value={newCommission.rate}
                            onChange={(e) =>
                              setNewCommission({ ...newCommission, rate: Number(e.target.value) })
                            }
                          />
                        </Form.Group>
                        <button type="submit" className="gi-btn-1 w-100">Créer</button>
                      </Form>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {tab === "events" && <AdminDirectoryEvents />}

            {tab === "providers" && <AdminDirectoryProviders />}

            {tab === "quotes" && (
              <>
                <AdminDirectoryQuotes />
                <AdminQuoteActivities />
              </>
            )}

            {tab === "catalog" && <AdminCatalogTab />}

            {tab === "payouts" && <AdminPayoutsPanel />}
          </>
        )}

        {freezeRef && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }} role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Geler la transaction</h5>
                  <button type="button" className="btn-close" onClick={() => setFreezeRef(null)} />
                </div>
                <Form onSubmit={submitFreeze}>
                  <div className="modal-body">
                    <p className="small text-muted mb-2">Réf. {freezeRef}</p>
                    <Form.Label>Motif * (envoyé au client et au prestataire)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={freezeNote}
                      onChange={(e) => setFreezeNote(e.target.value)}
                      required
                      minLength={5}
                      placeholder="Expliquez la raison du gel des fonds…"
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setFreezeRef(null)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-warning" disabled={freezing}>
                      {freezing ? "Gel en cours..." : "Geler et notifier"}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
