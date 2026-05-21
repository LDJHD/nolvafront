"use client";
import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { providersApi } from "@/lib/api";
import { payoutMethodLabel } from "@/lib/payoutMethods";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const PayoutMessagesPanel = () => {
  const [profile, setProfile] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await providersApi.myProfile()
      setProfile(res.data)
      if (res.data?.id) {
        const msgRes = await providersApi.listPayoutMessages({ provider_id: res.data.id })
        setMessages(msgRes.data || [])
      }
    } catch {
      showErrorToast("Impossible de charger les messages reversement")
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !profile?.id) return
    setSending(true)
    try {
      await providersApi.postPayoutMessage({
        provider_id: profile.id,
        body: body.trim(),
      })
      setBody("")
      showSuccessToast("Message envoyé")
      void load()
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Erreur")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="gi-vendor-dashboard-card mb-4 nolva-payout-chat">
      <div className="gi-vendor-card-header">
        <h5 className="mb-0">Reversements — échange avec l&apos;administration</h5>
      </div>
      <div className="gi-vendor-card-body">
        <p className="small text-muted">
          L&apos;administrateur peut vous contacter ici pour confirmer le réseau ou la carte utilisée pour vos
          versements. Mode enregistré :{" "}
          <strong>{payoutMethodLabel(profile?.momoNetwork || profile?.momo_network)}</strong> —{" "}
          {profile?.momoPhone || profile?.momo_phone || "non renseigné"}
        </p>

        <div className="nolva-payout-chat-messages mb-3">
          {messages.length === 0 ? (
            <p className="text-muted small mb-0">Aucun message pour le moment.</p>
          ) : (
            messages.map((m: any) => (
              <div
                key={m.id}
                className={`nolva-payout-chat-bubble ${
                  (m.senderRole || m.sender_role) === "admin" ? "admin" : "provider"
                }`}
              >
                <div className="small fw-semibold">
                  {(m.senderRole || m.sender_role) === "admin" ? "Admin NOLVA" : "Vous"}
                </div>
                <div>{m.body}</div>
                <div className="small text-muted">
                  {new Date(m.createdAt || m.created_at).toLocaleString("fr-FR")}
                </div>
              </div>
            ))
          )}
        </div>

        <Form onSubmit={send}>
          <Form.Control
            as="textarea"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Répondre à l'administration..."
          />
          <button type="submit" className="gi-btn-1 btn-sm mt-2" disabled={sending}>
            Envoyer
          </button>
        </Form>
      </div>
    </div>
  )
}

export default PayoutMessagesPanel
