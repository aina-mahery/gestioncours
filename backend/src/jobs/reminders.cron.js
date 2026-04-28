import cron from "node-cron";
import { query } from "../config/db.js";
import { sendEmailMock, sendSmsMock } from "../utils/twilio.service.js";

export function startFinanceRemindersCron() {
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Lancement du cron de rappels financiers...");
    try {
      const result = await query(
        `SELECT p.id, p.montant, p.montant_paye, p.statut, p.created_at, p.due_date,
                u.nom AS eleve_nom, u.email AS eleve_email, u.telephone AS eleve_telephone,
                c.nom AS cours_nom
         FROM paiements p
         INNER JOIN users u ON u.id = p.user_id
         INNER JOIN cours c ON c.id = p.cours_id
         WHERE p.statut IN ('impaye', 'partiel')
           AND p.created_at <= NOW() - INTERVAL '7 days'
         ORDER BY p.created_at ASC`
      );

      for (const row of result.rows) {
        const solde = Number((Number(row.montant || 0) - Number(row.montant_paye || 0)).toFixed(2));
        await sendEmailMock({
          to: row.eleve_email,
          subject: `Rappel de paiement - ${row.cours_nom}`,
          body: `Bonjour ${row.eleve_nom}, votre solde restant pour le cours \"${row.cours_nom}\" est de ${solde.toFixed(2)} €.`
        });
        await sendSmsMock({
          to: row.eleve_telephone || "NUMERO_NON_RENSEIGNE",
          message: `Rappel GestionCours Pro: solde ${solde.toFixed(2)} € pour le cours \"${row.cours_nom}\".`
        });
      }

      console.log(`✅ Cron rappels terminé. ${result.rows.length} dossier(s) traité(s).`);
    } catch (error) {
      console.error("❌ Erreur dans le cron de rappels :", error);
    }
  });
}
