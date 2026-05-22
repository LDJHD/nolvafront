"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { reservationsApi, quoteRequestsApi, eventsApi } from "@/lib/api";
import ReservationPaymentActions from "./ReservationPaymentActions";
import Link from "next/link";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import { Col, Row } from "react-bootstrap";

const UserDashboard = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("reservations");
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [resRes, qRes, tRes] = await Promise.allSettled([
        reservationsApi.myReservations({ limit: 20 }),
        quoteRequestsApi.myRequests({ limit: 20 }),
        eventsApi.myTickets({ limit: 20 }),
      ]);
      if (resRes.status === "fulfilled") {
        const d = resRes.value.data;
        setReservations(Array.isArray(d) ? d : d?.data || []);
      }
      if (qRes.status === "fulfilled") {
        const d = qRes.value.data;
        setQuoteRequests(Array.isArray(d) ? d : d?.data || []);
      }
      if (tRes.status === "fulfilled") {
        const d = tRes.value.data;
        setTickets(Array.isArray(d) ? d : d?.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <p>Connectez-vous pour accéder à votre espace. <Link href="/login">Se connecter</Link></p>
      </div>
    );
  }

  const statusLabel = (status: string) => {
    const map: any = {
      pending: "En attente",
      confirmed: "Confirmée",
      completed: "Terminée",
      cancelled: "Annulée",
      accepted: "Acceptée",
      rejected: "Refusée",
    };
    return map[status] || status;
  };

  const paymentLabel = (status: string) => {
    const map: any = {
      pending: "En attente",
      unpaid: "Non payé",
      deposit_paid: "Acompte payé",
      fully_paid: "Payé (séquestre)",
      paid: "Payé",
      refunded: "Remboursé",
    };
    return map[status] || status;
  };

  return (
    <section className="gi-vendor-dashboard padding-tb-40">
      <div className="container">
        <Row className="mb-minus-24px">
          <Col lg={3} md={12} className="mb-24">
            <div className="gi-sidebar-wrap gi-border-box gi-sticky-sidebar">
              <div className="gi-vendor-block-items">
                <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                  <div className="nolva-provider-avatar" style={{ width: "70px", height: "70px", fontSize: "28px", margin: "0 auto 10px" }}>
                    <span className="nolva-provider-initials">
                      {(user?.firstName || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h6 style={{ margin: 0 }}>{user?.firstName} {user?.lastName}</h6>
                  <small style={{ color: "#999" }}>{user?.email}</small>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("reservations"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "reservations" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "reservations" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "reservations" ? 600 : 400, borderLeft: activeTab === "reservations" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Réservations
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("quotes"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "quotes" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "quotes" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "quotes" ? 600 : 400, borderLeft: activeTab === "quotes" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Demandes de devis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("tickets"); }}
                      style={{ display: "block", padding: "12px 20px", background: activeTab === "tickets" ? "var(--nolva-red-glow)" : "transparent", color: activeTab === "tickets" ? "var(--nolva-primary)" : "#333", fontWeight: activeTab === "tickets" ? 600 : 400, borderLeft: activeTab === "tickets" ? "3px solid var(--nolva-primary)" : "3px solid transparent" }}
                    >
                      Mes Billets
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/user-profile"
                      style={{ display: "block", padding: "12px 20px", color: "#333" }}
                    >
                      Mon Profil
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Col>

          <Col lg={9} md={12} className="mb-24">
            {/* Résumé */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Réservations</h5>
                  <h3 style={{ color: "var(--nolva-red, var(--nolva-primary))" }}>{loading ? "..." : reservations.length}</h3>
                </div>
              </Col>
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Demandes de devis</h5>
                  <h3>{loading ? "..." : quoteRequests.length}</h3>
                </div>
              </Col>
              <Col md={4} className="mb-3">
                <div className="gi-vendor-dashboard-sort-card">
                  <h5>Billets</h5>
                  <h3>{loading ? "..." : tickets.length}</h3>
                </div>
              </Col>
            </Row>

            {/* Contenu selon tab */}
            {activeTab === "reservations" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Réservations</h5>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : reservations.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucune réservation pour le moment.</p>
                        <Link href="/prestataires" className="gi-btn-1">Trouver un prestataire</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Prestataire</th>
                            <th>Montant</th>
                            <th>Acompte</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map((r: any, i: number) => (
                            <tr key={i}>
                              <td>{r.provider?.businessName || r.service_provider?.business_name || "Prestataire"}</td>
                              <td>{(r.total_amount ?? r.totalAmount)?.toLocaleString()} FCFA</td>
                              <td>{(r.deposit_amount ?? r.depositAmount)?.toLocaleString()} FCFA</td>
                              <td>
                                <span className="nolva-status-badge">{paymentLabel(r.payment_status || r.paymentStatus)}</span>
                              </td>
                              <td>
                                <span className="nolva-status-badge">{statusLabel(r.status)}</span>
                              </td>
                              <td>
                                <ReservationPaymentActions reservation={r} onUpdated={fetchData} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quotes" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Demandes de devis</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/demande-devis">Nouvelle demande</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : quoteRequests.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucune demande de devis.</p>
                        <Link href="/demande-devis" className="gi-btn-1">Faire une demande</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Événement</th>
                            <th>Date</th>
                            <th>Budget</th>
                            <th>Ville</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteRequests.map((q: any) => (
                            <tr key={q.id}>
                              <td>{q.eventType || q.event_type}</td>
                              <td>{q.eventDate || q.event_date ? new Date(q.eventDate || q.event_date).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{(q.proposedPrice ?? q.proposed_price ?? q.budget) ? `${Number(q.proposedPrice ?? q.proposed_price ?? q.budget).toLocaleString()} FCFA` : "-"}</td>
                              <td>{q.location || "-"}</td>
                              <td>
                                <span className="nolva-status-badge">{statusLabel(q.status)}</span>
                                <Link href={`/devis/${q.id}`} className="d-block small mt-1">Voir / discuter</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Mes Billets</h5>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p style={{ padding: "20px" }}>Chargement...</p>
                    ) : tickets.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center" }}>
                        <p style={{ color: "#999", marginBottom: "15px" }}>Aucun billet acheté.</p>
                        <Link href="/evenements" className="gi-btn-1">Voir les événements</Link>
                      </div>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Événement</th>
                            <th>Date</th>
                            <th>Lieu</th>
                            <th>Quantité</th>
                            <th>Code QR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.map((t: any, i: number) => (
                            <tr key={i}>
                              <td>{t.event?.title || "Événement"}</td>
                              <td>{t.event?.event_date ? new Date(t.event.event_date).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{t.event?.location || "-"}</td>
                              <td>{t.quantity || 1}</td>
                              <td>
                                {t.qr_code ? (
                                  <span style={{ fontFamily: "monospace", fontSize: "12px", background: "#f5f5f5", padding: "3px 8px", borderRadius: "4px" }}>
                                    {t.qr_code}
                                  </span>
                                ) : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default UserDashboard;
