import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/admin-only", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({ message: "Accès admin autorisé.", user: req.user });
});
export default router;
