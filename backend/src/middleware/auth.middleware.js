import { verifyAccessToken } from "../utils/tokens.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Utilisateur non authentifié." });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : rôle insuffisant." });
    }
    next();
  };
}
