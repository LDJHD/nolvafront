"use client";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import { quoteRequestsApi, reservationsApi } from "@/lib/api";
import Link from "next/link";

const VendorDeshboard = () => {
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "provider") return;
    const fetchData = async () => {
      try {
        const [qRes, rRes] = await Promise.all([
          quoteRequestsApi.providerRequests({ limit: 5 }),
          reservationsApi.providerReservations({ limit: 5 }),
        ]);
        setQuoteRequests(Array.isArray(qRes.data) ? qRes.data : qRes.data?.data || []);
        setReservations(Array.isArray(rRes.data) ? rRes.data : rRes.data?.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "provider") {
    return (
      <div className="container py-5 text-center">
        <p>Acces reserve aux prestataires. <Link href="/login">Se connecter</Link></p>
      </div>
    );
  }

  const provider = user?.serviceProvider;
  const pendingQuotes = quoteRequests.filter((q: any) => q.status === "pending").length;
  const confirmedReservations = reservations.filter((r: any) => r.status === "confirmed").length;
  const totalRevenue = reservations
    .filter((r: any) => r.payment_status === "paid")
    .reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0);

  return (
    <>
      <section className="gi-vendor-dashboard padding-tb-40">
        <div className="container">
          <Row className="mb-minus-24px">
            <VendorSidebar />
            <Col lg={9} md={12} className="mb-24">

              <Row className="mb-4">
                <div className="container">
                  <div className="gi-vendor-cover">
                    <div className="detail">
                      <div className="nolva-provider-avatar" style={{ width: "80px", height: "80px", fontSize: "32px", overflow: "hidden" }}>
                        {provider?.profilePhoto || provider?.profile_photo || user?.avatar ? (
                          <img
                            src={provider?.profilePhoto || provider?.profile_photo || user?.avatar}
                            alt="photo profil prestataire"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="nolva-provider-initials">
                            {(provider?.business_name || user?.firstName || "P").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="v-detail">
                        <h5>{provider?.business_name || `${user?.firstName} ${user?.lastName}`}</h5>
                        <p>{provider?.type} &bull; {user?.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Row>

              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Demandes en attente</h5>
                    <h3 style={{ color: "var(--nolva-red)" }}>{loading ? "..." : pendingQuotes}</h3>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Reservations confirmees</h5>
                    <h3>{loading ? "..." : confirmedReservations}</h3>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Revenus percus</h5>
                    <h3>{loading ? "..." : `${totalRevenue.toLocaleString()} FCFA`}</h3>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="gi-vendor-dashboard-sort-card">
                    <h5>Total demandes</h5>
                    <h3>{loading ? "..." : quoteRequests.length}</h3>
                  </div>
                </Col>
              </Row>

              <div className="gi-vendor-dashboard-card m-b-30px">
                <div className="gi-vendor-card-header">
                  <h5>Dernieres demandes de devis</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/vendor-dashboard">Voir tout</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p>Chargement...</p>
                    ) : quoteRequests.length === 0 ? (
                      <p>Aucune demande de devis pour le moment.</p>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Evenement</th>
                            <th>Date</th>
                            <th>Budget</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteRequests.map((q: any) => (
                            <tr key={q.id}>
                              <td>{q.user?.firstName || q.user?.first_name} {q.user?.lastName || q.user?.last_name}</td>
                              <td>{q.eventType || q.event_type}</td>
                              <td>{q.eventDate || q.event_date ? new Date(q.eventDate || q.event_date).toLocaleDateString("fr-FR") : "-"}</td>
                              <td>{(q.proposedPrice ?? q.proposed_price ?? q.budget)?.toLocaleString?.() ?? "—"} FCFA</td>
                              <td>
                                <span className="nolva-status-badge">
                                  {q.status === "pending" ? "En attente" :
                                   q.status === "negotiating" ? "Discussion" :
                                   q.status === "accepted" ? "Validé — attente paiement" :
                                   q.status === "paid" ? "Payé" :
                                   q.status === "declined" ? "Refusé" : q.status}
                                </span>
                                <Link href={`/devis/${q.id}`} className="d-block small mt-1">Traiter</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Dernieres reservations</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/vendor-setting">Voir tout</Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <p>Chargement...</p>
                    ) : reservations.length === 0 ? (
                      <p>Aucune reservation pour le moment.</p>
                    ) : (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Montant</th>
                            <th>Acompte 30%</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map((r: any, i: number) => (
                            <tr key={i}>
                              <td>{r.user?.first_name} {r.user?.last_name}</td>
                              <td>{r.total_amount?.toLocaleString()} FCFA</td>
                              <td>{r.deposit_amount?.toLocaleString()} FCFA</td>
                              <td>
                                <span className="nolva-status-badge">
                                  {r.payment_status === "paid" ? "Paye" :
                                   r.payment_status === "deposit_paid" ? "Acompte paye" : "En attente"}
                                </span>
                              </td>
                              <td>
                                <span className="nolva-status-badge">
                                  {r.status === "confirmed" ? "Confirmee" :
                                   r.status === "completed" ? "Terminee" :
                                   r.status === "cancelled" ? "Annulee" : "En attente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default VendorDeshboard;
