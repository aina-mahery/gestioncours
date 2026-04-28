import { query } from "../config/db.js";
import { simulateCourseCreationEmail } from "../utils/notification.js";

const COURSE_COLORS = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#ea580c", "#0891b2", "#65a30d", "#db2777"];

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];
  return days.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6).sort((a, b) => a - b);
}

function parseHoraire(horaire, duree) {
  if (!horaire || typeof horaire !== "string") return { startHour: 8, endHour: 8 + Number(duree || 1) };
  const [startRaw, endRaw] = horaire.split("-");
  const startHour = Number((startRaw || "08:00").split(":")[0]);
  const endHour = Number((endRaw || "").split(":")[0]);
  if (Number.isInteger(startHour) && Number.isInteger(endHour) && startHour >= 0 && endHour <= 24 && endHour > startHour) {
    return { startHour, endHour };
  }
  return { startHour: 8, endHour: 8 + Number(duree || 1) };
}

function buildPlanning({ nom, jours, duree, horaire, coursId = "new" }) {
  const safeDays = normalizeDays(jours);
  const { startHour, endHour } = parseHoraire(horaire, duree);
  return safeDays.map((day, index) => ({
    sessionId: `${coursId}-s${index + 1}`,
    title: nom,
    dayOfWeek: day,
    startHour,
    endHour,
    room: "Salle A",
    color: COURSE_COLORS[index % COURSE_COLORS.length]
  }));
}

export async function createCours(req, res) {
  try {
    const { nom, description = "", duree, jours, sessions, horaire, capacite, formateurId } = req.body;
    if (!nom || !duree || !jours || !sessions || !horaire || !capacite) {
      return res.status(400).json({ message: "nom, duree, jours, sessions, horaire et capacite sont obligatoires." });
    }

    const safeDays = normalizeDays(jours);
    if (!safeDays.length) return res.status(400).json({ message: "Veuillez sélectionner au moins un jour de la semaine." });

    const numericDuree = Number(duree);
    const numericSessions = Number(sessions);
    const numericCapacite = Number(capacite);
    if ([numericDuree, numericSessions, numericCapacite].some((n) => Number.isNaN(n) || n <= 0)) {
      return res.status(400).json({ message: "duree, sessions et capacite doivent être des nombres positifs." });
    }

    let finalFormateurId = null;
    if (req.user?.role === "formateur") finalFormateurId = req.user.sub;
    else if (formateurId) finalFormateurId = Number(formateurId);

    const initialPlanning = buildPlanning({ nom, jours: safeDays, duree: numericDuree, horaire, coursId: "tmp" });
    const insertResult = await query(
      `INSERT INTO cours (nom, description, capacite, planning, duree, jours, sessions, horaire, formateur_id)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8, $9)
       RETURNING id, nom, description, capacite, planning, duree, jours, sessions, horaire, formateur_id, created_at`,
      [nom, description, numericCapacite, JSON.stringify(initialPlanning), numericDuree, JSON.stringify(safeDays), numericSessions, horaire, finalFormateurId]
    );

    const insertedCours = insertResult.rows[0];
    const finalizedPlanning = buildPlanning({ nom, jours: safeDays, duree: numericDuree, horaire, coursId: insertedCours.id });
    const updatePlanningResult = await query(
      `UPDATE cours SET planning = $1::jsonb WHERE id = $2
       RETURNING id, nom, description, capacite, planning, duree, jours, sessions, horaire, formateur_id, created_at`,
      [JSON.stringify(finalizedPlanning), insertedCours.id]
    );

    const savedCours = updatePlanningResult.rows[0];
    await simulateCourseCreationEmail({ nomCours: savedCours.nom, description: savedCours.description, capacite: savedCours.capacite });
    return res.status(201).json({ message: "Cours créé avec succès.", item: savedCours, notification: { simulated: true } });
  } catch (error) {
    console.error("createCours error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du cours." });
  }
}

export async function listCours(req, res) {
  try {
    const { date, formateurId, page = 1, limit = 20 } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (numericPage - 1) * numericLimit;

    const conditions = [];
    const params = [];
    if (formateurId) {
      params.push(Number(formateurId));
      conditions.push(`c.formateur_id = $${params.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM cours c ${whereClause}`, params);
    const total = countResult.rows[0]?.total || 0;

    params.push(numericLimit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const result = await query(
      `SELECT
         c.id, c.nom, c.description, c.capacite, c.planning, c.duree, c.jours, c.sessions, c.horaire,
         c.formateur_id, c.created_at, u.nom AS formateur_nom,
         COUNT(DISTINCT p.user_id)::int AS inscrits
       FROM cours c
       LEFT JOIN users u ON u.id = c.formateur_id
       LEFT JOIN paiements p ON p.cours_id = c.id
       ${whereClause}
       GROUP BY c.id, u.nom
       ORDER BY c.created_at DESC, c.id DESC
       LIMIT $${limitIdx}
       OFFSET $${offsetIdx}`,
      params
    );

    return res.status(200).json({
      items: result.rows.map((row) => ({
        id: row.id,
        nom: row.nom,
        description: row.description,
        capacite: Number(row.capacite || 0),
        duree: Number(row.duree || 1),
        jours: row.jours || [],
        sessions: Number(row.sessions || 1),
        horaire: row.horaire,
        formateurId: row.formateur_id,
        formateurNom: row.formateur_nom,
        inscrits: Number(row.inscrits || 0),
        planning: row.planning || [],
        createdAt: row.created_at
      })),
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit)
      },
      weekReference: date || null
    });
  } catch (error) {
    console.error("listCours error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des cours." });
  }
}

export async function updateCoursPlanning(req, res) {
  try {
    const { id } = req.params;
    const { sessionId, dayOfWeek, startHour, endHour } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId est obligatoire." });

    const safeDayOfWeek = Number(dayOfWeek);
    const safeStartHour = Number(startHour);
    const safeEndHour = Number(endHour);
    if (!Number.isInteger(safeDayOfWeek) || safeDayOfWeek < 0 || safeDayOfWeek > 6 || !Number.isInteger(safeStartHour) || !Number.isInteger(safeEndHour) || safeStartHour < 0 || safeEndHour > 24 || safeEndHour <= safeStartHour) {
      return res.status(400).json({ message: "Paramètres de planning invalides." });
    }

    const currentResult = await query(`SELECT id, planning FROM cours WHERE id = $1 LIMIT 1`, [id]);
    if (!currentResult.rows.length) return res.status(404).json({ message: "Cours introuvable." });

    const updatedPlanning = (currentResult.rows[0].planning || []).map((entry) => entry.sessionId !== sessionId ? entry : ({ ...entry, dayOfWeek: safeDayOfWeek, startHour: safeStartHour, endHour: safeEndHour }));
    const updateResult = await query(`UPDATE cours SET planning = $1::jsonb WHERE id = $2 RETURNING id, planning`, [JSON.stringify(updatedPlanning), id]);
    return res.status(200).json({ message: "Planning mis à jour avec succès.", item: updateResult.rows[0] });
  } catch (error) {
    console.error("updateCoursPlanning error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du planning." });
  }
}

export async function deleteCours(req, res) {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM cours WHERE id = $1 RETURNING id`, [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Cours introuvable." });
    return res.status(200).json({ message: "Cours supprimé avec succès." });
  } catch (error) {
    console.error("deleteCours error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression du cours." });
  }
}
