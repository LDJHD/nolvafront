"use client";
import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { adminApi } from "@/lib/api";
import { payoutMethodLabel } from "@/lib/payoutMethods";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const formatMoney = (n: number) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

const AdminPayoutsPanel = () => {
  const [pending, setPending] = useState<any[]>([])
  const [released, setReleased] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pendRes, payRes] = await Promise.all([
        adminApi.pendingPayouts(),
        adminApi.payouts({ limit: 20 }),
      ])
      setPending(pendRes.data || [])
      const d = payRes.data
      setReleased(d?.data || d || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const provider = selected?.reservation?.provider

  const loadMessages = useCallback(async (txn: any) => {
    const p = txn?.reservation?.provider
    if (!p?.id) return
    const res = await adminApi.listPayoutMessages({
      provider_id: p.id,
      transaction_id: txn.id,
    })
    setMessages(res.data || [])
  }, [])

  const selectTransaction = async (txn: any) => {
    setSelected(txn)
    setBody("")
    try {
      await loadMessages(txn)
    } catch {
      setMessages([])
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !provider?.id || !selected) return
    setSending(true)
    try {
      await adminApi.postPayoutMessage({
        provider_id: provider.id,
        transaction_id: selected.id,
        body: body.trim(),
      })
      setBody("")
      showSuccessToast("Message envoyé au prestataire")
      await loadMessages(selected)
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur envoi message")
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p>Chargement des reversements...</p>

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
                  <th>Net</th>
                  <th>Mode de paiement</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun paiement en séquestre à reverser</td>
                  </tr>
                ) : (
                  pending.map((t: any) => {
                    const p = t.reservation?.provider
                    return (
                      <tr key={t.id} className={selected?.id === t.id ? "table-active" : ""}>
                        <td>{t.reference}</td>
                        <td>{p?.businessName || p?.business_name || "—"}</td>
                        <td>{formatMoney(t.net_amount ?? t.netAmount)}</td>
                        <td>
                          <small>
                            {payoutMethodLabel(p?.momoNetwork || p?.momo_network)}
                            <br />
                            {p?.momoPhone || p?.momo_phone || "—"}
                          </small>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="gi-btn-2 btn-sm"
                            onClick={() => selectTransaction(t)}
                          >
                            Discuter
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gi-vendor-dashboard-card">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Reversements effectués</h5>
          </div>
          <div className="gi-vendor-card-body table-responsive">
            <table className="table gi-vender-table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Net</th>
                  <th>Libéré le</th>
                </tr>
              </thead>
              <tbody>
                {released.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Aucun reversement</td>
                  </tr>
                ) : (
                  released.map((t: any) => (
                    <tr key={t.id}>
                      <td>{t.reference}</td>
                      <td>{formatMoney(t.net_amount ?? t.netAmount)}</td>
                      <td>
                        {t.released_at
                          ? new Date(t.released_at).toLocaleString("fr-FR")
                          : "-"}
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
        <div className="gi-vendor-dashboard-card nolva-payout-chat">
          <div className="gi-vendor-card-header">
            <h5 className="mb-0">Échange avec le prestataire</h5>
          </div>
          <div className="gi-vendor-card-body">
            {!selected || !provider ? (
              <p className="text-muted mb-0">
                Sélectionnez un paiement en attente pour confirmer le mode de versement (Mobile Money ou carte)
                avec le prestataire.
              </p>
            ) : (
              <>
                <div className="mb-3 p-3 rounded" style={{ background: "#f8f9fa" }}>
                  <strong>{provider.businessName || provider.business_name}</strong>
                  <div className="small text-muted mt-1">
                    Réf. {selected.reference} · {formatMoney(selected.net_amount ?? selected.netAmount)}
                  </div>
                  <div className="small mt-2">
                    <strong>Mode choisi :</strong>{" "}
                    {payoutMethodLabel(provider.momoNetwork || provider.momo_network)}
                    <br />
                    <strong>Coordonnées :</strong> {provider.momoPhone || provider.momo_phone || "—"}
                  </div>
                </div>

                <div className="nolva-payout-chat-messages mb-3">
                  {messages.length === 0 ? (
                    <p className="text-muted small">Aucun message. Confirmez le réseau et le numéro à utiliser.</p>
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
                        <div className="small text-muted">
                          {new Date(m.createdAt || m.created_at).toLocaleString("fr-FR")}
                        </div>
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
                    placeholder="Ex: Nous reverserons sur votre numéro MTN +229…, pas Moov."
                    required
                  />
                  <button type="submit" className="gi-btn-1 w-100 mt-2" disabled={sending}>
                    {sending ? "Envoi..." : "Envoyer au prestataire"}
                  </button>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPayoutsPanel
