import PDFDocument from "pdfkit";

export function streamInvoicePdf(res, invoice) {
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `facture-${invoice.invoiceNumber}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);
  doc.fontSize(22).text("Facture - GestionCours Pro", { align: "center" });
  doc.moveDown();
  doc.fontSize(12)
    .text(`Facture n° : ${invoice.invoiceNumber}`)
    .text(`Date : ${invoice.invoiceDate}`)
    .text(`Élève : ${invoice.eleveNom}`)
    .text(`Email : ${invoice.eleveEmail}`)
    .text(`Cours : ${invoice.coursNom}`);

  doc.moveDown();
  doc.fontSize(14).text("Détail financier", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12)
    .text(`Montant total : ${invoice.montantTotal.toFixed(2)} €`)
    .text(`Montant payé : ${invoice.montantPaye.toFixed(2)} €`)
    .text(`Solde : ${invoice.solde.toFixed(2)} €`)
    .text(`Statut : ${invoice.statut}`)
    .text(`Échéance : ${invoice.dueDate}`);

  doc.moveDown();
  doc.fontSize(14).text("Récapitulatif", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12)
    .text(`Montant fixe : ${invoice.montantFixe.toFixed(2)} €`)
    .text(`Coût par session : ${invoice.coutParSession.toFixed(2)} €`)
    .text(`Réduction fidélité : -${invoice.reduction.toFixed(2)} €`);

  doc.moveDown(2);
  doc.fontSize(10).fillColor("#555").text("Merci pour votre confiance.", { align: "center" });
  doc.end();
}
