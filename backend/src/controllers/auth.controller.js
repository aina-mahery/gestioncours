import bcrypt from "bcrypt";
import { query } from "../config/db.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

function parseDurationToDate(duration) {
  const now = new Date();
  if (duration.endsWith("d")) {
    now.setDate(now.getDate() + Number(duration.replace("d", "")));
    return now;
  }
  if (duration.endsWith("h")) {
    now.setHours(now.getHours() + Number(duration.replace("h", "")));
    return now;
  }
  if (duration.endsWith("m")) {
    now.setMinutes(now.getMinutes() + Number(duration.replace("m", "")));
    return now;
  }
  now.setDate(now.getDate() + 7);
  return now;
}

export async function register(req, res) {
  try {
    const { nom, email, password, role = "eleve" } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ message: "nom, email et password sont obligatoires." });
    }
    if (!["admin", "formateur", "eleve"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await query(
      `INSERT INTO users (nom, email, role, photo) VALUES ($1, $2, $3, NULL) RETURNING id, nom, email, role`,
      [nom, email, role]
    );

    const user = userResult.rows[0];
    await query(`INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)`, [user.id, passwordHash]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = parseDurationToDate(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d");

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES ($1, $2, $3, FALSE)`,
      [user.id, refreshHash, expiresAt]
    );

    return res.status(201).json({ message: "Inscription réussie.", user, accessToken, refreshToken });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email et password sont obligatoires." });
    }

    const result = await query(
      `SELECT u.id, u.nom, u.email, u.role, uc.password_hash FROM users u INNER JOIN user_credentials uc ON uc.user_id = u.id WHERE u.email = $1 LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const userRow = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const user = { id: userRow.id, nom: userRow.nom, email: userRow.email, role: userRow.role };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = parseDurationToDate(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d");

    await query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES ($1, $2, $3, FALSE)`,
      [user.id, refreshHash, expiresAt]
    );

    return res.status(200).json({ message: "Connexion réussie.", user, accessToken, refreshToken });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken requis." });

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ message: "Refresh token invalide ou expiré." });
    }

    const userId = decoded.sub;
    const tokenResult = await query(
      `SELECT id, token_hash, expires_at, revoked FROM refresh_tokens WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (tokenResult.rows.length === 0) return res.status(401).json({ message: "Aucun refresh token enregistré." });
    const storedToken = tokenResult.rows[0];
    if (storedToken.revoked) return res.status(401).json({ message: "Refresh token révoqué." });
    if (new Date(storedToken.expires_at) < new Date()) return res.status(401).json({ message: "Refresh token expiré." });

    const matches = await bcrypt.compare(refreshToken, storedToken.token_hash);
    if (!matches) return res.status(401).json({ message: "Refresh token invalide." });

    const userResult = await query(`SELECT id, nom, email, role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });

    const user = userResult.rows[0];
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    const newExpiresAt = parseDurationToDate(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d");

    await query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES ($1, $2, $3, FALSE)`,
      [user.id, newRefreshHash, newExpiresAt]
    );

    return res.status(200).json({ message: "Token rafraîchi avec succès.", accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("refresh error:", error);
    return res.status(500).json({ message: "Erreur serveur lors du refresh." });
  }
}

export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken requis." });

    try {
      const decoded = verifyRefreshToken(refreshToken);
      await query("DELETE FROM refresh_tokens WHERE user_id = $1", [decoded.sub]);
    } catch (error) {
      return res.status(200).json({ message: "Déconnexion traitée." });
    }

    return res.status(200).json({ message: "Déconnexion réussie." });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la déconnexion." });
  }
}
