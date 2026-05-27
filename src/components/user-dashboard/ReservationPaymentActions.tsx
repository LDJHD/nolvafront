"use client";
import { useState } from "react";
import { paymentsApi, reservationsApi } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

type Props = {
  reservation: any;
  onUpdated?: () => void;
};

const ReservationPaymentActions = ({ reservation, onUpdated }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [reason, setReason] = useState("");

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.initiateReservation(reservation.id);
      const url = res.data.paymentUrl;
      if (url) window.location.href = url;
      else showErrorToast("Lien de paiement indisponible");
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!confirm("Confirmer que la prestation est terminee ? Le paiement sera libere.")) return;
    setLoading(true);
    try {
      await paymentsApi.validateService({ reservation_id: reservation.id });
      showSuccessToast("Service valide - paiement en cours de liberation");
      onUpdated?.();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async (points: 0 | 3 | 5) => {
    setLoading(true);
    try {
      await reservationsApi.awardProviderPoints(reservation.id, points);
      showSuccessToast(`${points} point(s) attribue(s) au prestataire`);
      onUpdated?.();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (reason.length < 10) {
      showErrorToast("Decrivez le probleme (10 caracteres minimum)");
      return;
    }
    setLoading(true);
    try {
      const txRes = await paymentsApi.getReservationTransaction(reservation.id);
      const ref = txRes.data.reference;
      await paymentsApi.openDispute({ transaction_ref: ref, reason });
      showSuccessToast("Litige ouvert - NOLVA va examiner votre demande");
      setShowDispute(false);
      setReason("");
      onUpdated?.();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const ps = reservation.payment_status || reservation.paymentStatus;
  const st = reservation.status;
  const pointsAwardedAt =
    reservation.provider_points_awarded_at || reservation.providerPointsAwardedAt;
  const pointsAwarded =
    reservation.provider_points_awarded ?? reservation.providerPointsAwarded;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "140px" }}>
      {ps === "unpaid" && (
        <button type="button" className="btn btn-sm gi-btn-1 nolva-btn-reserve" disabled={loading} onClick={handlePay}>
          Payer (FedaPay)
        </button>
      )}
      {ps === "fully_paid" && st === "confirmed" && (
        <button type="button" className="btn btn-sm btn-success" disabled={loading} onClick={handleValidate}>
          Service termine
        </button>
      )}
      {ps === "fully_paid" && st === "completed" && !pointsAwardedAt && (
        <div className="nolva-points-actions">
          <span className="small text-muted">Attribuer des points</span>
          <div className="d-flex gap-1">
            {[0, 3, 5].map((points) => (
              <button
                key={points}
                type="button"
                className="btn btn-sm btn-outline-danger"
                disabled={loading}
                onClick={() => handleAwardPoints(points as 0 | 3 | 5)}
              >
                {points}
              </button>
            ))}
          </div>
        </div>
      )}
      {pointsAwardedAt && (
        <span className="small text-muted">{pointsAwarded ?? 0} point(s) attribue(s)</span>
      )}
      {ps === "fully_paid" && st !== "disputed" && st !== "completed" && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          disabled={loading}
          onClick={() => setShowDispute(!showDispute)}
        >
          Ouvrir un litige
        </button>
      )}
      {showDispute && (
        <>
          <textarea
            className="form-control form-control-sm"
            rows={2}
            placeholder="Decrivez le probleme..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button type="button" className="btn btn-sm btn-danger" disabled={loading} onClick={handleDispute}>
            Envoyer
          </button>
        </>
      )}
    </div>
  );
};

export default ReservationPaymentActions;
