"use client";
import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { adminApi } from "@/lib/api";
import {
  PAYOUT_METHOD_OPTIONS,
  payoutDestinationHint,
  payoutMethodLabel,
  payoutNeedsPhone,
} from "@/lib/payoutMethods";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const formatMoney = (n: number) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

const AdminPayoutsPanel = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [released, setReleased] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutDestination, setPayoutDestination] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendRes, payRes, histRes] = await Promise.all([
        adminApi.pendingPayouts(),
        adminApi.payouts({ limit: 20 }),
        adminApi.actionHistory(),
      ]);
      setPending(pendRes.data || []);
      const d = payRes.data;
      setReleased(d?.data || d || []);
      const h = histRes.data;
      setHistory(h?.data || h || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const provider = selected?.reservation?.provider;
  const netAmount = Number(selected?.net_amount ?? selected?.netAmount ?? 0);
  const commissionAmount = Number(
    selected?.commission_amount ?? selected?.commissionAmount ?? 0
  );

  const applyProviderDefaults = (txn: any) => {
    const p = txn?.reservation?.provider;
    const method = p?.momoNetwork || p?.momo_network || "bj_mtn";
    const dest = p?.momoPhone || p?.momo_phone || "";
    setPayoutMethod(method);
    setPayoutDestination(dest);
    setPayoutAmount(String(txn?.net_amount ?? txn?.netAmount ?? ""));
  };

  const loadMessages = useCallback(async (txn: any) => {
    const p = txn?.reservation?.provider;
    if (!p?.id) return;
    const res = await adminApi.listPayoutMessages({
      provider_id: p.id,
      transaction_id: txn.id,
    });
    setMessages(res.data || []);
  }, []);

  const selectTransaction = async (txn: any) => {
    setSelected(txn);
    setBody("");
    applyProviderDefaults(txn);
    try {
      await loadMessages(txn);
      const hres = await adminApi.actionHistory({ transaction_id: txn.id });
      const hd = hres.data;
      setHistory((prev) => {
        const txnLogs = hd?.data || hd || [];
        return [...txnLogs, ...prev.filter((x) => x.transaction_id !== txn.id)].slice(0, 40);
      });
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !provider?.id || !selected) return;
    setSending(true);
    try {
      await adminApi.postPayoutMessage({
        provider_id: provider.id,
        transaction_id: selected.id,
        body: body.trim(),
      });
      setBody("");
      showSuccessToast("Message envoyé au prestataire");
      await loadMessages(selected);
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur envoi message");
    } finally {
      setSending(false);
    }
  };

  const executePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id) return;
    setPaying(true);
    try {
      const res = await adminApi.executePayout({
        transaction_id: selected.id,
        amount: payoutAmount ? Number(payoutAmount) : undefined,
        payout_method: payoutMethod,
        payout_destination: payoutDestination.trim(),
        note: payoutNote.trim() || undefined,
      });
      showSuccessToast(res.data?.message || "Reversement effectué");
      setSelected(null);
      await load();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur reversement");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p>Chargement des reversements...</p>;

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="gi-vendor-dashboard-card mb-4">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Paiements en attente de reversement</h5>
          </div>
          <div className="gi-vendor-card-body table-responsive">
            <table className="table gi-vender-table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Prestataire</th>
                  <th>Brut</th>
                  <th>Commission</th>
                  <th>Net</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Aucun paiement en séquestre à reverser</td>
                  </tr>
                ) : (
                  pending.map((t: any) => {
                    const p = t.reservation?.provider;
                    return (
                      <tr key={t.id} className={selected?.id === t.id ? "table-active" : ""}>
                        <td>{t.reference}</td>
                        <td>{p?.businessName || p?.business_name || "—"}</td>
                        <td>{formatMoney(t.amount)}</td>
                        <td>{formatMoney(t.commission_amount ?? t.commissionAmount)}</td>
                        <td>{formatMoney(t.net_amount ?? t.netAmount)}</td>
                        <td className="text-nowrap">
                          <button
                            type="button"
                            className="gi-btn-1 btn-sm me-1"
                            onClick={() => selectTransaction(t)}
                          >
                            Payer
                          </button>
                          <button
                            type="button"
                            className="gi-btn-2 btn-sm"
                            onClick={() => selectTransaction(t)}
                          >
                            Discuter
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gi-vendor-dashboard-card mb-4">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Reversements effectués</h5>
          </div>
          <div className="gi-vendor-card-body table-responsive">
            <table className="table gi-vender-table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Net</th>
                  <th>Mode</th>
                  <th>Libéré le</th>
                </tr>
              </thead>
              <tbody>
                {released.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Aucun reversement</td>
                  </tr>
                ) : (
                  released.map((t: any) => (
                    <tr key={t.id}>
                      <td>{t.reference}</td>
                      <td>{formatMoney(t.net_amount ?? t.netAmount)}</td>
                      <td>
                        <small>{payoutMethodLabel(t.payout_method ?? t.payoutMethod)}</small>
                      </td>
                      <td>
                        {t.released_at || t.releasedAt
                          ? new Date(t.released_at || t.releasedAt).toLocaleString("fr-FR")
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Historique des actions admin</h5>
          </div>
          <div className="gi-vendor-card-body table-responsive" style={{ maxHeight: 280, overflowY: "auto" }}>
            <table className="table gi-vender-table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Aucun historique</td>
                  </tr>
                ) : (
                  history.map((log: any) => (
                    <tr key={log.id}>
                      <td>
                        <small>
                          {new Date(log.createdAt || log.created_at).toLocaleString("fr-FR")}
                        </small>
                      </td>
                      <td>{log.action_type || log.actionType}</td>
                      <td>
                        <small>{log.note || "—"}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="gi-vendor-dashboard-card nolva-payout-chat mb-4">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Reversement FedaPay</h5>
          </div>
          <div className="gi-vendor-card-body">
            {!selected || !provider ? (
              <p className="text-muted mb-0">
                Sélectionnez un paiement en attente pour reverser le montant net au prestataire
                (commission NOLVA déjà déduite).
              </p>
            ) : (
              <Form onSubmit={executePayout}>
                <div className="mb-3 p-3 rounded" style={{ background: "#f8f9fa" }}>
                  <strong>{provider.businessName || provider.business_name}</strong>
                  <div className="small text-muted mt-1">Réf. {selected.reference}</div>
                  <div className="small mt-2">
                    Montant client : <strong>{formatMoney(selected.amount)}</strong>
                    <br />
                    Commission NOLVA : <strong>{formatMoney(commissionAmount)}</strong>
                    <br />
                    Net prestataire : <strong>{formatMoney(netAmount)}</strong>
                  </div>
                </div>

                <Form.Group className="mb-2">
                  <Form.Label>Montant à reverser (FCFA)</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={netAmount}
                    step={1}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Mode FedaPay</Form.Label>
                  <Form.Select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    required
                  >
                    {PAYOUT_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} ({o.region})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Par défaut : choix du prestataire dans son profil. Modifiable si convenu dans la
                    discussion.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>
                    {payoutNeedsPhone(payoutMethod) ? "Numéro Mobile Money" : "Coordonnées"}
                  </Form.Label>
                  <Form.Control
                    value={payoutDestination}
                    onChange={(e) => setPayoutDestination(e.target.value)}
                    placeholder={payoutDestinationHint(payoutMethod)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Note interne (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                  />
                </Form.Group>

                <button type="submit" className="gi-btn-1 w-100 mb-2" disabled={paying}>
                  {paying ? "Envoi FedaPay..." : "Payer via FedaPay"}
                </button>
              </Form>
            )}
          </div>
        </div>

        <div className="gi-vendor-dashboard-card nolva-payout-chat">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Échange avec le prestataire</h5>
          </div>
          <div className="gi-vendor-card-body">
            {!selected || !provider ? (
              <p className="text-muted mb-0">Sélectionnez un paiement pour discuter du mode de versement.</p>
            ) : (
              <>
                <div className="nolva-payout-chat-messages mb-3">
                  {messages.length === 0 ? (
                    <p className="text-muted small">Aucun message.</p>
                  ) : (
                    messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`nolva-payout-chat-bubble ${
                          (m.senderRole || m.sender_role) === "admin" ? "admin" : "provider"
                        }`}
                      >
                        <div className="small fw-semibold">
                          {(m.senderRole || m.sender_role) === "admin" ? "Admin NOLVA" : "Prestataire"}
                        </div>
                        <div>{m.body}</div>
                      </div>
                    ))
                  )}
                </div>
                <Form onSubmit={sendMessage}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Confirmer le réseau et le numéro de versement…"
                    required
                  />
                  <button type="submit" className="gi-btn-2 w-100 mt-2" disabled={sending}>
                    {sending ? "Envoi..." : "Envoyer au prestataire"}
                  </button>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayoutsPanel;
