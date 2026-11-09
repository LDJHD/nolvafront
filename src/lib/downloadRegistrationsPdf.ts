import jsPDF from "jspdf";

export const downloadRegistrationsPdf = (
  eventTitle: string,
  registrations: any[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Liste des inscrits`, 14, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(eventTitle, 14, 28);
  doc.setFontSize(10);
  doc.text(`Nombre d'inscrits : ${registrations.length}`, 14, 36);
  doc.text(`Date d'export : ${new Date().toLocaleDateString("fr-FR")}`, 14, 42);

  // Table header
  const headers = ["#", "Nom", "Prénom", "Téléphone", "Email", "Inscrit le"];
  const colWidths = [10, 35, 30, 35, 45, 25];
  let y = 52;
  const rowHeight = 8;

  // Header row
  doc.setFillColor(109, 40, 217);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  let x = 14;
  headers.forEach((h, i) => {
    doc.rect(x, y - 6, colWidths[i], rowHeight, "F");
    doc.text(h, x + 2, y - 1);
    x += colWidths[i];
  });
  y += rowHeight;

  // Data rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  registrations.forEach((r: any, index: number) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
      // Re-draw header
      doc.setFillColor(109, 40, 217);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      x = 14;
      headers.forEach((h, i) => {
        doc.rect(x, y - 6, colWidths[i], rowHeight, "F");
        doc.text(h, x + 2, y - 1);
        x += colWidths[i];
      });
      y += rowHeight;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }

    const row = [
      String(index + 1),
      r.lastName || r.last_name || "—",
      r.firstName || r.first_name || "—",
      r.phone || "—",
      r.email || "—",
      r.createdAt || r.created_at
        ? new Date(r.createdAt || r.created_at).toLocaleDateString("fr-FR")
        : "—",
    ];

    x = 14;
    row.forEach((cell, i) => {
      doc.rect(x, y - 6, colWidths[i], rowHeight);
      const text = String(cell).substring(0, 20);
      doc.text(text, x + 2, y - 1);
      x += colWidths[i];
    });
    y += rowHeight;
  });

  doc.save(`inscrits-${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
};
