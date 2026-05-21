"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { normalizeList } from "@/lib/nolvaData";

const actionLabels: Record<string, string> = {
  quote_created: "Client : demande créée",
  message_sent: "Message envoyé",
  system_message: "Message système",
  quote_accepted: "Prestataire : devis validé",
  quote_declined: "Prestataire : devis refusé",
  payment_confirmed: "Client : paiement confirmé",
  admin_status_update: "Admin : statut modifié",
};

const AdminQuoteActivities = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listQuoteActivities({ limit: 40 });
      setRows(normalizeList(res.data));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="gi-vendor-dashboard-card mt-4">
      <div className="gi-vendor-card-header">
        <h5 className="mb-0">Historique des devis</h5>
        <p className="small text-muted mb-0 mt-1">
          Création, messages, validation prestataire, paiement client.
        </p>
      </div>
      <div className="gi-vendor-card-body">
        {loading ? (
          <p>Chargement...</p>
        ) : rows.length === 0 ? (
          <p className="text-muted">Aucune activité.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {rows.map((a: any) => (
              <li key={a.id} className="border-bottom py-2 small">
                <strong>{actionLabels[a.action] || a.action}</strong>
                {" — "}
                Devis #{a.quoteRequestId || a.quote_request_id}
                {" — "}
                {new Date(a.createdAt || a.created_at).toLocaleString("fr-FR")}
                {a.actor && (
                  <>
                    {" "}
                    ({a.actor.firstName || a.actor.first_name} {a.actor.lastName || a.actor.last_name})
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminQuoteActivities;
