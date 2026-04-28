import Stripe from "stripe";
import { query } from "../config/db.js";
import { computePaymentStatus } from "../utils/finance.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createStripeCheckout(req, res) {
  try {
    const { paiementId } = req.body;
    if (!paiementId) return res.status(400).json({ message: "paiementId est obligatoire." });

    const paymentResult = await query(
      `SELECT p.id, p.montant, p.montant_paye, p.statut, u.nom AS eleve_nom, c.nom AS cours_nom
       FROM paiements p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN cours c ON c.id = p.cours_id
       WHERE p.id = $1 LIMIT 1`,
      [paiementId]
    );
    if (!paymentResult.rows.length) return res.status(404).json({ message: "Paiement introuvable." });

    const payment = paymentResult.rows[0];
    const montantTotal = Number(payment.montant || 0);
    const montantPaye = Number(payment.montant_paye || 0);
    const restant = Number((montantTotal - montantPaye).toFixed(2));
    if (restant <= 0) return res.status(400).json({ message: "Ce paiement est déjà soldé." });

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(restant * 100),
            product_data: {
              name: `Écolage - ${payment.cours_nom}`,
              description: `Élève: ${payment.eleve_nom}`
            }
          }
        }],
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
        metadata: { paiementId: String(payment.id) }
      });

      await query(`UPDATE paiements SET stripe_session_id = $1, updated_at = NOW() WHERE id = $2`, [session.id, paiementId]);
      return res.status(200).json({ mode: "stripe", sessionId: session.id, url: session.url });
    }

    const newMontantPaye = montantTotal;
    const statusResult = computePaymentStatus(montantTotal, newMontantPaye);
    const updateResult = await query(
      `UPDATE paiements
       SET montant_paye = $1, statut = $2, updated_at = NOW(), stripe_session_id = $3, stripe_payment_intent = $4
       WHERE id = $5
       RETURNING id, montant, montant_paye, statut`,
      [newMontantPaye, statusResult.statut, `mock_sess_${Date.now()}`, `mock_pi_${Date.now()}`, paiementId]
    );

    return res.status(200).json({
      mode: "mock",
      message: "Paiement Stripe simulé avec succès.",
      item: {
        id: updateResult.rows[0].id,
        montantTotal: Number(updateResult.rows[0].montant),
        montantPaye: Number(updateResult.rows[0].montant_paye),
        statut: updateResult.rows[0].statut
      }
    });
  } catch (error) {
    console.error("createStripeCheckout error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la préparation du paiement Stripe." });
  }
}

export async function stripeWebhook(req, res) {
  try {
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers["stripe-signature"];
      const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const paiementId = session.metadata?.paiementId;
        if (paiementId) {
          const paymentResult = await query(`SELECT id, montant FROM paiements WHERE id = $1 LIMIT 1`, [paiementId]);
          if (paymentResult.rows.length > 0) {
            const montantTotal = Number(paymentResult.rows[0].montant || 0);
            const statusResult = computePaymentStatus(montantTotal, montantTotal);
            await query(
              `UPDATE paiements SET montant_paye = $1, statut = $2, updated_at = NOW(), stripe_payment_intent = $3 WHERE id = $4`,
              [montantTotal, statusResult.statut, session.payment_intent || null, paiementId]
            );
          }
        }
      }
      return res.status(200).json({ received: true });
    }

    const { paiementId } = req.body || {};
    if (!paiementId) return res.status(400).json({ message: "paiementId est requis pour le webhook mock." });
    const paymentResult = await query(`SELECT id, montant FROM paiements WHERE id = $1 LIMIT 1`, [paiementId]);
    if (!paymentResult.rows.length) return res.status(404).json({ message: "Paiement introuvable." });
    const montantTotal = Number(paymentResult.rows[0].montant || 0);
    const statusResult = computePaymentStatus(montantTotal, montantTotal);
    await query(
      `UPDATE paiements SET montant_paye = $1, statut = $2, updated_at = NOW(), stripe_payment_intent = $3 WHERE id = $4`,
      [montantTotal, statusResult.statut, `mock_pi_${Date.now()}`, paiementId]
    );
    return res.status(200).json({ received: true, simulated: true });
  } catch (error) {
    console.error("stripeWebhook error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du traitement du webhook Stripe." });
  }
}
