"use client";
import Link from "next/link";

export default function NolvaFooter() {
  return (
    <footer style={{ background: "#1A1A1A", color: "#fff", marginTop: "60px" }}>
      <div className="container" style={{ padding: "50px 0 30px" }}>
        <div className="row g-4">
          {/* Logo + description */}
          <div className="col-lg-4 col-md-6">
            <div style={{ fontWeight: 800, fontSize: "28px", marginBottom: "16px" }}>
              NOL<span style={{ color: "var(--nolva-gold)" }}>VA</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "1.8" }}>
              La plateforme de référence pour trouver les meilleurs prestataires
              événementiels au Bénin. DJs, photographes, hôtesses, animateurs et plus encore.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {["facebook", "instagram", "tiktok"].map((s) => (
                <a key={s} href="#" style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#fff",
                  textDecoration: "none", fontSize: "14px", fontWeight: 600
                }}>
                  {s === "facebook" ? "f" : s === "instagram" ? "in" : "tt"}
                </a>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div className="col-lg-2 col-md-6">
            <h6 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--nolva-gold)" }}>Plateforme</h6>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Trouver un prestataire", href: "/prestataires" },
                { label: "Événements", href: "/evenements" },
                { label: "Devenir prestataire", href: "/inscription?role=provider" },
                { label: "Comment ça marche", href: "/comment-ca-marche" },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "10px" }}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--nolva-gold)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prestataires */}
          <div className="col-lg-2 col-md-6">
            <h6 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--nolva-gold)" }}>Prestataires</h6>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "DJs", href: "/prestataires?type=dj" },
                { label: "Photographes", href: "/prestataires?type=photographe" },
                { label: "Hôtesses", href: "/prestataires?type=hotesse" },
                { label: "Animateurs", href: "/prestataires?type=animateur" },
                { label: "Sécurité", href: "/prestataires?type=securite" },
                { label: "Artistes", href: "/prestataires?type=artiste" },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: "10px" }}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--nolva-gold)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6">
            <h6 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--nolva-gold)" }}>Contact</h6>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "2" }}>
              <p>📍 Cotonou, Bénin</p>
              <p>📞 +229 XX XX XX XX</p>
              <p>✉️ contact@nolva.bj</p>
            </div>
            <div style={{ marginTop: "20px" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "10px" }}>
                Restez informé des nouveautés :
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="email" placeholder="Votre email"
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)",
                    color: "#fff", fontSize: "13px"
                  }} />
                <button style={{
                  background: "var(--nolva-gold)", border: "none", color: "#fff",
                  borderRadius: "8px", padding: "10px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px"
                }}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bas de footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "40px", paddingTop: "24px", gap: "16px" }}
          className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
            © {new Date().getFullYear()} NOLVA. Tous droits réservés.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/confidentialite" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
              Confidentialité
            </Link>
            <Link href="/politique-nolva" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
              Paiement sécurisé
            </Link>
            <Link href="/terms-condition" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
              CGU
            </Link>
            <Link href="/contact" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
