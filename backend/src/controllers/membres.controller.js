import bcrypt from "bcrypt";
import crypto from "crypto";
import { parse } from "csv-parse/sync";
import { pool, query } from "../config/db.js";

function generateTemporaryPassword() {
  return `Tmp-${crypto.randomBytes(6).toString("hex")}!`;
}

function normalizeRole(role) {
  if (!role) return "eleve";
  const value = String(role).trim().toLowerCase();
  return ["admin", "formateur", "eleve"].includes(value) ? value : null;
}

function normalizeStatus(statut) {
  if (!statut) return "actif";
  const value = String(statut).trim().toLowerCase();
  return ["actif", "inactif"].includes(value) ? value : null;
}

export async function listMembres(req, res) {
  try {
    const { role, search, statut } = req.query;
    const conditions = [];
    const params = [];

    if (role) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.nom ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (statut) {
      params.push(statut);
      conditions.push(`u.statut = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        u.id,
        u.nom,
        u.email,
        u.role,
        u.statut,
        u.solde,
        CASE WHEN u.photo IS NOT NULL THEN encode(u.photo, 'base64') ELSE NULL END AS photo_base64,
        COUNT(DISTINCT p.cours_id) AS cours_inscrits
      FROM users u
      LEFT JOIN paiements p ON p.user_id = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.nom ASC
    `;

    const result = await query(sql, params);
    return res.status(200).json({
      items: result.rows.map((row) => ({
        id: row.id,
        nom: row.nom,
        email: row.email,
        role: row.role,
        statut: row.statut,
        solde: Number(row.solde || 0),
        coursInscrits: Number(row.cours_inscrits || 0),
        photoBase64: row.photo_base64
      }))
    });
  } catch (error) {
    console.error("listMembres error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement des membres." });
  }
}

export async function createMembre(req, res) {
  try {
    const { nom, email, role, statut } = req.body;
    if (!nom || !email || !role) {
      return res.status(400).json({ message: "nom, email et role sont obligatoires." });
    }

    const normalizedRole = normalizeRole(role);
    const normalizedStatus = normalizeStatus(statut || "actif");
    if (!normalizedRole || !normalizedStatus) {
      return res.status(400).json({ message: "Rôle ou statut invalide." });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Un membre avec cet email existe déjà." });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const userResult = await query(
      `INSERT INTO users (nom, email, role, statut, solde, photo) VALUES ($1, $2, $3, $4, 0, NULL) RETURNING id, nom, email, role, statut, solde`,
      [nom, email, normalizedRole, normalizedStatus]
    );
    const user = userResult.rows[0];

    await query(`INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)`, [user.id, passwordHash]);

    return res.status(201).json({
      message: "Membre créé avec succès.",
      item: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        solde: Number(user.solde || 0),
        coursInscrits: 0,
        photoBase64: null
      },
      temporaryPassword
    });
  } catch (error) {
    console.error("createMembre error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du membre." });
  }
}

export async function updateMembre(req, res) {
  try {
    const { id } = req.params;
    const { nom, email, role, statut, solde } = req.body;
    const fields = [];
    const params = [];

    if (nom) {
      params.push(nom);
      fields.push(`nom = $${params.length}`);
    }
    if (email) {
      const existing = await query("SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1", [email, id]);
      if (existing.rows.length > 0) return res.status(409).json({ message: "Cet email est déjà utilisé par un autre membre." });
      params.push(email);
      fields.push(`email = $${params.length}`);
    }
    if (role) {
      const normalizedRole = normalizeRole(role);
      if (!normalizedRole) return res.status(400).json({ message: "Rôle invalide." });
      params.push(normalizedRole);
      fields.push(`role = $${params.length}`);
    }
    if (statut) {
      const normalizedStatus = normalizeStatus(statut);
      if (!normalizedStatus) return res.status(400).json({ message: "Statut invalide." });
      params.push(normalizedStatus);
      fields.push(`statut = $${params.length}`);
    }
    if (solde !== undefined) {
      const numericSolde = Number(solde);
      if (Number.isNaN(numericSolde)) return res.status(400).json({ message: "Le solde doit être un nombre valide." });
      params.push(numericSolde);
      fields.push(`solde = $${params.length}`);
    }
    if (req.file) {
      params.push(req.file.buffer);
      fields.push(`photo = $${params.length}`);
    }
    if (fields.length === 0) return res.status(400).json({ message: "Aucune donnée à mettre à jour." });

    params.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING id, nom, email, role, statut, solde, CASE WHEN photo IS NOT NULL THEN encode(photo, 'base64') ELSE NULL END AS photo_base64`,
      params
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Membre introuvable." });

    const countResult = await query(`SELECT COUNT(DISTINCT cours_id) AS cours_inscrits FROM paiements WHERE user_id = $1`, [id]);
    const user = result.rows[0];

    return res.status(200).json({
      message: "Membre mis à jour avec succès.",
      item: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        solde: Number(user.solde || 0),
        coursInscrits: Number(countResult.rows[0]?.cours_inscrits || 0),
        photoBase64: user.photo_base64
      }
    });
  } catch (error) {
    console.error("updateMembre error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du membre." });
  }
}

export async function importMembresCsv(req, res) {
  const client = await pool.connect();
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier CSV requis." });
    const csvContent = req.file.buffer.toString("utf-8");
    const rows = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
    if (!rows.length) return res.status(400).json({ message: "Le fichier CSV est vide." });

    const preparedRows = [];
    const invalidRows = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const nom = row.nom?.trim();
      const email = row.email?.trim();
      const role = normalizeRole(row.role || "eleve");
      const statut = normalizeStatus(row.statut || "actif");
      if (!nom || !email || !role || !statut) {
        invalidRows.push({ line: index + 2, row });
        continue;
      }
      const temporaryPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      preparedRows.push({ nom, email, role, statut, temporaryPassword, passwordHash });
    }

    if (!preparedRows.length) {
      return res.status(400).json({ message: "Aucune ligne valide à importer.", invalidRows });
    }

    await client.query("BEGIN");
    const values = [];
    const placeholders = [];
    preparedRows.forEach((item, index) => {
      const base = index * 4;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, 0, NULL)`);
      values.push(item.nom, item.email, item.role, item.statut);
    });

    const insertUsersQuery = `
      INSERT INTO users (nom, email, role, statut, solde, photo)
      VALUES ${placeholders.join(", ")}
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, nom, role, statut, solde
    `;

    const insertedUsersResult = await client.query(insertUsersQuery, values);
    const insertedUsers = insertedUsersResult.rows;

    const insertedByEmail = new Map(insertedUsers.map((u) => [u.email, u]));
    const credentialValues = [];
    const credentialPlaceholders = [];
    const importedAccounts = [];
    let cursor = 1;

    preparedRows.forEach((item) => {
      const insertedUser = insertedByEmail.get(item.email);
      if (!insertedUser) return;
      credentialPlaceholders.push(`($${cursor}, $${cursor + 1})`);
      credentialValues.push(insertedUser.id, item.passwordHash);
      cursor += 2;
      importedAccounts.push({
        id: insertedUser.id,
        nom: insertedUser.nom,
        email: insertedUser.email,
        role: insertedUser.role,
        statut: insertedUser.statut,
        solde: Number(insertedUser.solde || 0),
        temporaryPassword: item.temporaryPassword
      });
    });

    if (credentialPlaceholders.length > 0) {
      await client.query(
        `INSERT INTO user_credentials (user_id, password_hash) VALUES ${credentialPlaceholders.join(", ")} ON CONFLICT (user_id) DO NOTHING`,
        credentialValues
      );
    }

    await client.query("COMMIT");
    return res.status(201).json({
      message: "Import CSV terminé.",
      importedCount: insertedUsers.length,
      skippedCount: preparedRows.length - insertedUsers.length,
      invalidRows,
      importedAccounts
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("importMembresCsv error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'import CSV." });
  } finally {
    client.release();
  }
}

export async function deleteMembre(req, res) {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Membre introuvable." });
    return res.status(200).json({ message: "Membre supprimé avec succès." });
  } catch (error) {
    console.error("deleteMembre error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression du membre." });
  }
}
