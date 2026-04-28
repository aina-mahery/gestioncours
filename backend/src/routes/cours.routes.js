import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { createCours, listCours, updateCoursPlanning, deleteCours } from "../controllers/cours.controller.js";

const router = Router();
router.get("/", authenticateToken, authorizeRoles("admin", "formateur"), listCours);
router.post("/", authenticateToken, authorizeRoles("admin", "formateur"), createCours);
router.patch("/:id/planning", authenticateToken, authorizeRoles("admin", "formateur"), updateCoursPlanning);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteCours);
export default router;
