export function generateInvoiceNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `FAC-${datePart}-${randomPart}`;
}

export function computePaymentStatus(total, paid) {
  const montant = Number(total || 0);
  const montantPaye = Number(paid || 0);
  const solde = Number((montant - montantPaye).toFixed(2));

  if (solde <= 0) return { statut: "paye", solde: 0 };
  if (montantPaye > 0) return { statut: "partiel", solde };
  return { statut: "impaye", solde };
}

export function calculateEcolage({ sessions, fidele }) {
  const nbSessions = Number(sessions || 0);
  const montantFixe = 500;
  const coutParSession = 20 * nbSessions;
  const sousTotal = montantFixe + coutParSession;
  const reduction = fidele ? Number((sousTotal * 0.1).toFixed(2)) : 0;
  const montantTotal = Number((sousTotal - reduction).toFixed(2));
  return { montantFixe, coutParSession, nbSessions, sousTotal, reduction, montantTotal };
}
