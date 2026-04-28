import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { generateQr, markPresence, getSessionRoster, getPresenceReports, exportPresenceCsv, exportPresencePdf, checkAbsencesAndAlert } from "../controllers/presence.controller.js";

const router = Router();
router.post("/generate-qr/:sessionId", authenticateToken, authorizeRoles("admin", "formateur"), generateQr);
router.patch("/:id", authenticateToken, authorizeRoles("admin", "formateur"), markPresence);
router.get("/session/:sessionId/roster", authenticateToken, authorizeRoles("admin", "formateur"), getSessionRoster);
router.get("/rapports", authenticateToken, authorizeRoles("admin", "formateur"), getPresenceReports);
router.get("/rapports/csv", authenticateToken, authorizeRoles("admin", "formateur"), exportPresenceCsv);
router.get("/rapports/pdf", authenticateToken, authorizeRoles("admin", "formateur"), exportPresencePdf);
router.post("/alerts/check", authenticateToken, authorizeRoles("admin", "formateur"), checkAbsencesAndAlert);
export default router;
