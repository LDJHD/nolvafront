"use client";

type ProofField = {
  label: string;
  value?: string | number | null;
};

type DownloadProofOptions = {
  title: string;
  subtitle?: string;
  fileName: string;
  qrCode?: string | null;
  fields: ProofField[];
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const qrImageUrl = (value: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(value)}`;

const safeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

export function downloadPaymentProof({ title, subtitle, fileName, qrCode, fields }: DownloadProofOptions) {
  if (typeof window === "undefined") return;

  const rows = fields
    .filter((field) => field.value !== undefined && field.value !== null && field.value !== "")
    .map(
      (field) => `
        <div class="row">
          <span>${escapeHtml(field.label)}</span>
          <strong>${escapeHtml(field.value)}</strong>
        </div>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #202124; margin: 0; padding: 32px; background: #f6f7f9; }
    .proof { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #e4e7ec; border-radius: 8px; padding: 28px; }
    .brand { color: #b51f2a; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 20px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    p { margin: 0 0 22px; color: #667085; }
    .grid { display: grid; grid-template-columns: 1fr ${qrCode ? "220px" : "0"}; gap: 24px; align-items: start; }
    .row { border-bottom: 1px solid #eef0f3; padding: 12px 0; display: flex; justify-content: space-between; gap: 20px; }
    .row span { color: #667085; }
    .row strong { text-align: right; word-break: break-word; }
    .qr { text-align: center; border: 1px solid #eef0f3; border-radius: 8px; padding: 14px; }
    .qr img { width: 180px; height: 180px; }
    .qr code { display: block; margin-top: 10px; font-size: 11px; word-break: break-all; color: #475467; }
    .footer { margin-top: 24px; font-size: 12px; color: #98a2b3; }
    @media print { body { background: #fff; padding: 0; } .proof { border: 0; } }
  </style>
</head>
<body>
  <main class="proof">
    <div class="brand">NOLVA</div>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    <section class="grid">
      <div>${rows}</div>
      ${
        qrCode
          ? `<div class="qr"><img alt="QR code" src="${qrImageUrl(qrCode)}"><code>${escapeHtml(qrCode)}</code></div>`
          : ""
      }
    </section>
    <div class="footer">Document genere depuis le tableau de bord NOLVA.</div>
  </main>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(fileName) || "justificatif-nolva"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
