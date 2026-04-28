import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = Router();
router.get("/dashboard", authenticateToken, authorizeRoles("admin"), getAdminDashboard);
export default router;
