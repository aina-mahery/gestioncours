import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { listMembres, createMembre, updateMembre, importMembresCsv, deleteMembre } from "../controllers/membres.controller.js";

const router = Router();
router.get("/", authenticateToken, authorizeRoles("admin", "formateur"), listMembres);
router.post("/", authenticateToken, authorizeRoles("admin"), createMembre);
router.post("/import-csv", authenticateToken, authorizeRoles("admin"), upload.single("file"), importMembresCsv);
router.patch("/:id", authenticateToken, authorizeRoles("admin"), upload.single("photo"), updateMembre);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteMembre);
export default router;
