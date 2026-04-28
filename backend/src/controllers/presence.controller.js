import { query } from "../config/db.js";
import { generateQrToken } from "../utils/qr.js";
import { sendEmailMock } from "../utils/twilio.service.js";
import PDFDocument from "pdfkit";

export async function generateQr(req, res) {
  try {
    const { sessionId } = req.params;
    const token = generateQrToken(sessionId);
    await query(`UPDATE presence SET qr_token = $1 WHERE session_id = $2`, [token, sessionId]);
    return res.status(200).json({ sessionId, qrToken: token, expiresIn: "15 minutes", payload: `${sessionId}|${token}` });
  } catch (error) {
    console.error("generateQr error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la génération du QR." });
  }
}

export async function markPresence(req, res) {
  try {
    const { id } = req.params;
    const { qrToken, statut = "present" } = req.body;
    if (!["present", "absent", "retard"].includes(statut)) {
      return res.status(400).json({ message: "Statut invalide." });
    }
    const sql = qrToken
      ? `UPDATE presence SET statut = $1, scan_time = NOW() WHERE id = $2 AND qr_token = $3 RETURNING *`
      : `UPDATE presence SET statut = $1, scan_time = NOW() WHERE id = $2 RETURNING *`;
    const params = qrToken ? [statut, id, qrToken] : [statut, id];
    const result = await query(sql, params);
    if (!result.rows.length) return res.status(400).json({ message: "Présence introuvable, QR invalide ou expiré." });
    return res.status(200).json({ message: "Présence mise à jour.", item: result.rows[0] });
  } catch (error) {
    console.error("markPresence error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la présence." });
  }
}

export async function getSessionRoster(req, res) {
  try {
    const { sessionId } = req.params;
    const result = await query(
      `SELECT p.id, p.session_id, p.user_id, p.statut, p.scan_time, u.nom, u.email
       FROM presence p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.session_id = $1
       ORDER BY u.nom ASC`,
      [sessionId]
    );
    return res.status(200).json({
      items: result.rows.map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        nom: row.nom,
        email: row.email,
        statut: row.statut,
        scanTime: row.scan_time
      }))
    });
  } catch (error) {
    console.error("getSessionRoster error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement de la session." });
  }
}

export async function getPresenceReports(req, res) {
  try {
    const { coursId } = req.query;
    if (!coursId) return res.status(400).json({ message: "coursId est obligatoire." });

    const courseResult = await query(`SELECT planning FROM cours WHERE id = $1 LIMIT 1`, [coursId]);
    if (!courseResult.rows.length) return res.status(404).json({ message: "Cours introuvable." });
    const planning = courseResult.rows[0].planning || [];
    const sessionIds = planning.map((entry) => entry.sessionId);
    if (!sessionIds.length) return res.status(200).json({ tauxMoyen: 0, details: [] });

    const result = await query(
      `SELECT u.nom,
              COUNT(*) FILTER (WHERE p.statut = 'present') AS presents,
              COUNT(*) FILTER (WHERE p.statut = 'absent') AS absents,
              COUNT(*) FILTER (WHERE p.statut = 'retard') AS retards,
              COUNT(*) AS total
       FROM presence p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.session_id = ANY($1::varchar[])
       GROUP BY u.nom
       ORDER BY u.nom ASC`,
      [sessionIds]
    );

    const details = result.rows.map((row) => {
      const total = Number(row.total || 0) || 1;
      const taux = Math.round((Number(row.presents || 0) / total) * 100);
      return {
        nom: row.nom,
        presents: Number(row.presents || 0),
        absents: Number(row.absents || 0),
        retards: Number(row.retards || 0),
        total: Number(row.total || 0),
        taux
      };
    });

    const tauxMoyen = details.length ? Math.round(details.reduce((sum, item) => sum + item.taux, 0) / details.length) : 0;
    return res.status(200).json({ tauxMoyen, details });
  } catch (error) {
    console.error("getPresenceReports error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des rapports de présence." });
  }
}

export async function exportPresenceCsv(req, res) {
  try {
    const { coursId } = req.query;
    const fakeRes = { status: () => fakeRes, json: (payload) => payload };
    const data = await getPresenceReports({ query: { coursId } }, fakeRes);
    const payload = data?.details ? data : await (async () => {
      const result = await query(`SELECT planning FROM cours WHERE id = $1 LIMIT 1`, [coursId]);
      const sessionIds = (result.rows[0]?.planning || []).map((e) => e.sessionId);
      const stats = await query(`SELECT u.nom,
              COUNT(*) FILTER (WHERE p.statut = 'present') AS presents,
              COUNT(*) FILTER (WHERE p.statut = 'absent') AS absents,
              COUNT(*) FILTER (WHERE p.statut = 'retard') AS retards,
              COUNT(*) AS total
       FROM presence p INNER JOIN users u ON u.id = p.user_id WHERE p.session_id = ANY($1::varchar[]) GROUP BY u.nom ORDER BY u.nom ASC`, [sessionIds]);
      const details = stats.rows.map((row) => ({ nom: row.nom, presents: Number(row.presents || 0), absents: Number(row.absents || 0), retards: Number(row.retards || 0), total: Number(row.total || 0), taux: Math.round((Number(row.presents || 0) / (Number(row.total || 0) || 1)) * 100) }));
      const tauxMoyen = details.length ? Math.round(details.reduce((sum, item) => sum + item.taux, 0) / details.length) : 0;
      return { tauxMoyen, details };
    })();

    const rows = ["Nom,Présents,Absents,Retards,Total,Taux"];
    payload.details.forEach((item) => rows.push(`${item.nom},${item.presents},${item.absents},${item.retards},${item.total},${item.taux}`));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=rapport-presence.csv");
    return res.status(200).send(rows.join("\n"));
  } catch (error) {
    console.error("exportPresenceCsv error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'export CSV." });
  }
}

export async function exportPresencePdf(req, res) {
  try {
    const { coursId } = req.query;
    const reportResult = await query(`SELECT planning, nom FROM cours WHERE id = $1 LIMIT 1`, [coursId]);
    if (!reportResult.rows.length) return res.status(404).json({ message: "Cours introuvable." });
    const sessionIds = (reportResult.rows[0].planning || []).map((e) => e.sessionId);
    const stats = await query(`SELECT u.nom,
              COUNT(*) FILTER (WHERE p.statut = 'present') AS presents,
              COUNT(*) FILTER (WHERE p.statut = 'absent') AS absents,
              COUNT(*) FILTER (WHERE p.statut = 'retard') AS retards,
              COUNT(*) AS total
       FROM presence p INNER JOIN users u ON u.id = p.user_id WHERE p.session_id = ANY($1::varchar[]) GROUP BY u.nom ORDER BY u.nom ASC`, [sessionIds]);
    const details = stats.rows.map((row) => ({ nom: row.nom, presents: Number(row.presents || 0), absents: Number(row.absents || 0), retards: Number(row.retards || 0), total: Number(row.total || 0), taux: Math.round((Number(row.presents || 0) / (Number(row.total || 0) || 1)) * 100) }));
    const tauxMoyen = details.length ? Math.round(details.reduce((sum, item) => sum + item.taux, 0) / details.length) : 0;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=rapport-presence.pdf");
    doc.pipe(res);
    doc.fontSize(20).text("Rapport de présence", { align: "center" });
    doc.moveDown();
    doc.text(`Cours : ${reportResult.rows[0].nom}`);
    doc.text(`Taux moyen : ${tauxMoyen}%`);
    doc.moveDown();
    details.forEach((item) => {
      doc.text(`${item.nom} — Présents: ${item.presents}, Absents: ${item.absents}, Retards: ${item.retards}, Taux: ${item.taux}%`);
    });
    doc.end();
  } catch (error) {
    console.error("exportPresencePdf error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'export PDF." });
  }
}

export async function checkAbsencesAndAlert(req, res) {
  try {
    const result = await query(
      `SELECT u.email, u.nom, COUNT(*)::int AS absences
       FROM presence p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.statut = 'absent'
       GROUP BY u.email, u.nom
       HAVING COUNT(*) > 3`
    );

    for (const row of result.rows) {
      await sendEmailMock({
        to: row.email,
        subject: "Alerte absences cumulées",
        body: `L'élève ${row.nom} a cumulé ${row.absences} absences.`
      });
    }

    if (res) {
      return res.status(200).json({ message: "Vérification des absences effectuée.", alerts: result.rows.length });
    }
  } catch (error) {
    console.error("checkAbsencesAndAlert error:", error);
    if (res) return res.status(500).json({ message: "Erreur serveur lors de la vérification des absences." });
  }
}
