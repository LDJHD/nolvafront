"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import Spinner from "@/components/button/Spinner";
import Link from "next/link";
import { paymentsApi } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PaymentConfirmationPage = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // "ticket" ou "reservation"
  const ref = searchParams.get("ref"); // transaction reference
  const sandbox = searchParams.get("sandbox");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!ref || !isAuthenticated) {
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        let res;
        if (type === "ticket") {
          res = await paymentsApi.confirmTicket({ transaction_ref: ref });
        } else {
          res = await paymentsApi.confirmReservation({ transaction_ref: ref });
        }
        setResult(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Erreur lors de la confirmation"
        );
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [ref, type, isAuthenticated]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Confirmation de paiement" />
        <div className="text-center py-5">
          <Spinner />
          <p className="mt-3" style={{ color: "var(--nolva-gray)" }}>
            Verification de votre paiement en cours...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Confirmation de paiement" />
      <section className="padding-tb-40">
        <div className="container">
          <div
            className="row justify-content-center"
            style={{ minHeight: "400px" }}
          >
            <div className="col-lg-6">
              <div className="gi-vendor-dashboard-card text-center">
                <div className="gi-vendor-card-body" style={{ padding: "40px" }}>
                  {error ? (
                    <>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(239,68,68,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          fontSize: "36px",
                          color: "#ef4444",
                        }}
                      >
                        <i className="fi fi-rr-cross-circle"></i>
                      </div>
                      <h4 style={{ marginBottom: "12px" }}>Echec du paiement</h4>
                      <p style={{ color: "var(--nolva-gray)", marginBottom: "24px" }}>
                        {error}
                      </p>
                      <Link href="/evenements" className="gi-btn-2">
                        Retour aux evenements
                      </Link>
                    </>
                  ) : result ? (
                    <>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(5,150,105,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          fontSize: "36px",
                          color: "#059669",
                        }}
                      >
                        <i className="fi fi-rr-check-circle"></i>
                      </div>
                      <h4 style={{ marginBottom: "12px" }}>
                        {result.message || "Paiement confirme !"}
                      </h4>

                      {/* Détails ticket */}
                      {result.ticket && (
                        <div
                          style={{
                            background: "var(--nolva-light)",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "20px",
                            textAlign: "left",
                          }}
                        >
                          <p style={{ marginBottom: "8px" }}>
                            <strong>Type :</strong> {result.ticket.type}
                          </p>
                          <p style={{ marginBottom: "8px" }}>
                            <strong>Montant :</strong>{" "}
                            {Number(result.ticket.amount).toLocaleString()} FCFA
                          </p>
                          <p style={{ marginBottom: "8px" }}>
                            <strong>QR Code :</strong>{" "}
                            <code
                              style={{
                                fontSize: "12px",
                                background: "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {result.ticket.qrCode}
                            </code>
                          </p>
                          <p style={{ marginBottom: "0" }}>
                            <strong>Statut :</strong>{" "}
                            <span
                              style={{
                                color: "#059669",
                                fontWeight: 600,
                              }}
                            >
                              Valide
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Détails transaction */}
                      {result.transaction && (
                        <div
                          style={{
                            background: "var(--nolva-light)",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "20px",
                            textAlign: "left",
                          }}
                        >
                          <p style={{ marginBottom: "8px" }}>
                            <strong>Reference :</strong>{" "}
                            {result.transaction.reference}
                          </p>
                          <p style={{ marginBottom: "8px" }}>
                            <strong>Montant :</strong>{" "}
                            {Number(
                              result.transaction.amount
                            ).toLocaleString()}{" "}
                            FCFA
                          </p>
                          <p style={{ marginBottom: "0", fontSize: "13px", color: "var(--nolva-gray)" }}>
                            <i className="fi fi-rr-shield-check" style={{ color: "#059669" }}></i>{" "}
                            Paiement securise via NOLVA
                          </p>
                        </div>
                      )}

                      <div className="d-flex gap-2 justify-content-center mt-3">
                        {type === "ticket" ? (
                          <Link href="/evenements" className="gi-btn-1">
                            <i className="fi fi-rr-calendar"></i> Mes evenements
                          </Link>
                        ) : (
                          <Link href="/prestataires" className="gi-btn-1">
                            <i className="fi fi-rr-briefcase"></i> Mes
                            reservations
                          </Link>
                        )}
                        <Link href="/home" className="gi-btn-2">
                          Accueil
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>Aucune transaction trouvee</h4>
                      <p style={{ color: "var(--nolva-gray)" }}>
                        {!isAuthenticated
                          ? "Connectez-vous pour confirmer votre paiement."
                          : "Reference de transaction manquante."}
                      </p>
                      {!isAuthenticated ? (
                        <Link href="/login" className="gi-btn-1">
                          Se connecter
                        </Link>
                      ) : (
                        <Link href="/home" className="gi-btn-2">
                          Retour a l&apos;accueil
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentConfirmationPage;
