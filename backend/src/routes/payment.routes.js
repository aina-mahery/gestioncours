import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { createStripeCheckout } from "../controllers/payment.controller.js";

const router = Router();
router.post("/stripe", authenticateToken, authorizeRoles("admin", "formateur"), createStripeCheckout);
export default router;
