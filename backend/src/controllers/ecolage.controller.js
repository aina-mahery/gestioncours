import { query } from "../config/db.js";
import { calculateEcolage, computePaymentStatus, generateInvoiceNumber } from "../utils/finance.js";
import { streamInvoicePdf } from "../utils/invoice.js";
import { sendSmsMock } from "../utils/twilio.service.js";

function buildStatusFromPaid(total, paid) {
  return computePaymentStatus(total, paid).statut;
}

export async function calculEcolage(req, res) {
  try {
    const { eleveId, coursId } = req.body;
    if (!eleveId || !coursId) return res.status(400).json({ message: "eleveId et coursId sont obligatoires." });

    const studentResult = await query(`SELECT id, nom, email, fidele FROM users WHERE id = $1 AND role = 'eleve' LIMIT 1`, [eleveId]);
    if (!studentResult.rows.length) return res.status(404).json({ message: "Élève introuvable." });

    const courseResult = await query(`SELECT id, nom, sessions FROM cours WHERE id = $1 LIMIT 1`, [coursId]);
    if (!courseResult.rows.length) return res.status(404).json({ message: "Cours introuvable." });

    const eleve = studentResult.rows[0];
    const cours = courseResult.rows[0];
    const finance = calculateEcolage({ sessions: cours.sessions, fidele: eleve.fidele });

    const existingPaymentResult = await query(`SELECT id, montant, montant_paye, invoice_number, created_at, due_date FROM paiements WHERE user_id = $1 AND cours_id = $2 LIMIT 1`, [eleveId, coursId]);

    if (existingPaymentResult.rows.length > 0) {
      const existing = existingPaymentResult.rows[0];
      const montantPaye = Number(existing.montant_paye || 0);
      const statut = buildStatusFromPaid(finance.montantTotal, montantPaye);
      const updateResult = await query(
        `UPDATE paiements SET montant = $1, statut = $2, updated_at = NOW() WHERE id = $3 RETURNING id, user_id, cours_id, montant, montant_paye, statut, due_date, invoice_number, created_at, updated_at`,
        [finance.montantTotal, statut, existing.id]
      );
      const paiement = updateResult.rows[0];
      return res.status(200).json({
        message: "Écolage recalculé avec succès.",
        breakdown: finance,
        item: {
          id: paiement.id,
          eleveId: paiement.user_id,
          coursId: paiement.cours_id,
          montantTotal: Number(paiement.montant),
          montantPaye: Number(paiement.montant_paye),
          solde: Number((Number(paiement.montant) - Number(paiement.montant_paye)).toFixed(2)),
          statut: paiement.statut,
          dueDate: paiement.due_date,
          invoiceNumber: paiement.invoice_number
        }
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const insertResult = await query(
      `INSERT INTO paiements (user_id, cours_id, montant, montant_paye, statut, invoice_number) VALUES ($1, $2, $3, 0, $4, $5)
       RETURNING id, user_id, cours_id, montant, montant_paye, statut, due_date, invoice_number, created_at, updated_at`,
      [eleveId, coursId, finance.montantTotal, buildStatusFromPaid(finance.montantTotal, 0), invoiceNumber]
    );
    const paiement = insertResult.rows[0];
    return res.status(201).json({
      message: "Écolage calculé et paiement créé.",
      breakdown: finance,
      item: {
        id: paiement.id,
        eleveId: paiement.user_id,
        coursId: paiement.cours_id,
        montantTotal: Number(paiement.montant),
        montantPaye: Number(paiement.montant_paye),
        solde: Number((Number(paiement.montant) - Number(paiement.montant_paye)).toFixed(2)),
        statut: paiement.statut,
        dueDate: paiement.due_date,
        invoiceNumber: paiement.invoice_number
      }
    });
  } catch (error) {
    console.error("calculEcolage error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du calcul de l'écolage." });
  }
}

export async function getRappels(req, res) {
  try {
    const { status = "impaye" } = req.query;
    const statuses = status === "all" ? ["impaye", "partiel"] : [status];

    const result = await query(
      `SELECT p.id, p.user_id, p.cours_id, p.montant, p.montant_paye, p.statut, p.due_date, p.created_at,
              u.nom AS eleve_nom, u.email AS eleve_email, u.telephone AS eleve_telephone,
              c.nom AS cours_nom
       FROM paiements p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN cours c ON c.id = p.cours_id
       WHERE p.statut = ANY($1::paiement_statut_enum[])
       ORDER BY p.due_date ASC, p.created_at ASC`,
      [statuses]
    );

    return res.status(200).json({
      items: result.rows.map((row) => ({
        id: row.id,
        eleveId: row.user_id,
        eleveNom: row.eleve_nom,
        eleveEmail: row.eleve_email,
        eleveTelephone: row.eleve_telephone,
        coursId: row.cours_id,
        coursNom: row.cours_nom,
        montantTotal: Number(row.montant || 0),
        montantPaye: Number(row.montant_paye || 0),
        solde: Number((Number(row.montant || 0) - Number(row.montant_paye || 0)).toFixed(2)),
        statut: row.statut,
        dueDate: row.due_date,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error("getRappels error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des rappels." });
  }
}

export async function getEcolageDashboard(req, res) {
  try {
    const { status = "", search = "" } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`p.statut = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.nom ILIKE $${params.length} OR u.email ILIKE $${params.length} OR c.nom ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const listResult = await query(
      `SELECT p.id, p.user_id, p.cours_id, p.montant, p.montant_paye, p.statut, p.due_date, p.created_at, p.invoice_number,
              u.nom AS eleve_nom, u.email AS eleve_email, u.telephone AS eleve_telephone,
              c.nom AS cours_nom
       FROM paiements p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN cours c ON c.id = p.cours_id
       ${whereClause}
       ORDER BY p.created_at DESC, p.id DESC`,
      params
    );

    const statsResult = await query(
      `SELECT to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month_key,
              SUM(p.montant)::numeric(10,2) AS total_due,
              SUM(p.montant_paye)::numeric(10,2) AS total_paid,
              CASE WHEN SUM(p.montant) = 0 THEN 0 ELSE ROUND((SUM(p.montant_paye) / SUM(p.montant)) * 100, 2) END AS recovery_rate
       FROM paiements p
       WHERE p.created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
       GROUP BY 1
       ORDER BY 1 ASC`
    );

    return res.status(200).json({
      items: listResult.rows.map((row) => ({
        id: row.id,
        eleveId: row.user_id,
        eleveNom: row.eleve_nom,
        eleveEmail: row.eleve_email,
        eleveTelephone: row.eleve_telephone,
        coursId: row.cours_id,
        coursNom: row.cours_nom,
        montantTotal: Number(row.montant || 0),
        montantPaye: Number(row.montant_paye || 0),
        solde: Number((Number(row.montant || 0) - Number(row.montant_paye || 0)).toFixed(2)),
        statut: row.statut,
        dueDate: row.due_date,
        createdAt: row.created_at,
        invoiceNumber: row.invoice_number
      })),
      recovery: statsResult.rows.map((row) => ({
        month: row.month_key,
        totalDue: Number(row.total_due || 0),
        totalPaid: Number(row.total_paid || 0),
        recoveryRate: Number(row.recovery_rate || 0)
      }))
    });
  } catch (error) {
    console.error("getEcolageDashboard error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement du dashboard financier." });
  }
}

export async function sendManualSmsReminder(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.id, p.montant, p.montant_paye, p.statut,
              u.nom AS eleve_nom, u.telephone AS eleve_telephone,
              c.nom AS cours_nom
       FROM paiements p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN cours c ON c.id = p.cours_id
       WHERE p.id = $1 LIMIT 1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Paiement introuvable." });
    const row = result.rows[0];
    const solde = Number((Number(row.montant || 0) - Number(row.montant_paye || 0)).toFixed(2));
    const smsResult = await sendSmsMock({
      to: row.eleve_telephone || "NUMERO_NON_RENSEIGNE",
      message: `Bonjour ${row.eleve_nom}, rappel de paiement pour le cours "${row.cours_nom}". Solde restant : ${solde.toFixed(2)} €.`
    });
    return res.status(200).json({ message: "Rappel SMS simulé avec succès.", notification: smsResult });
  } catch (error) {
    console.error("sendManualSmsReminder error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'envoi du SMS." });
  }
}

export async function getFacturePdf(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.id, p.montant, p.montant_paye, p.statut, p.due_date, p.created_at, p.invoice_number,
              u.nom AS eleve_nom, u.email AS eleve_email, u.fidele,
              c.nom AS cours_nom, c.sessions
       FROM paiements p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN cours c ON c.id = p.cours_id
       WHERE p.id = $1 LIMIT 1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Facture introuvable." });

    const row = result.rows[0];
    const finance = calculateEcolage({ sessions: row.sessions, fidele: row.fidele });
    const montantTotal = Number(row.montant || 0);
    const montantPaye = Number(row.montant_paye || 0);
    const solde = Number((montantTotal - montantPaye).toFixed(2));

    return streamInvoicePdf(res, {
      invoiceNumber: row.invoice_number || generateInvoiceNumber(),
      invoiceDate: new Date(row.created_at).toLocaleDateString("fr-FR"),
      eleveNom: row.eleve_nom,
      eleveEmail: row.eleve_email,
      coursNom: row.cours_nom,
      montantTotal,
      montantPaye,
      solde,
      statut: row.statut,
      dueDate: new Date(row.due_date).toLocaleDateString("fr-FR"),
      montantFixe: finance.montantFixe,
      coutParSession: finance.coutParSession,
      reduction: finance.reduction
    });
  } catch (error) {
    console.error("getFacturePdf error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la génération de la facture PDF." });
  }
}
