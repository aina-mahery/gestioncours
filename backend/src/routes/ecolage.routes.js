import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { calculEcolage, getRappels, getFacturePdf, getEcolageDashboard, sendManualSmsReminder } from "../controllers/ecolage.controller.js";

const router = Router();
router.post("/calcul", authenticateToken, authorizeRoles("admin", "formateur"), calculEcolage);
router.get("/dashboard", authenticateToken, authorizeRoles("admin", "formateur"), getEcolageDashboard);
router.get("/rappels", authenticateToken, authorizeRoles("admin", "formateur"), getRappels);
router.post("/:id/sms", authenticateToken, authorizeRoles("admin", "formateur"), sendManualSmsReminder);
router.get("/:id/pdf", authenticateToken, authorizeRoles("admin", "formateur"), getFacturePdf);
export default router;
