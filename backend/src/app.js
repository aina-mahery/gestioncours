import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import membresRoutes from "./routes/membres.routes.js";
import coursRoutes from "./routes/cours.routes.js";
import ecolageRoutes from "./routes/ecolage.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import presenceRoutes from "./routes/presence.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { stripeWebhook } from "./controllers/payment.controller.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.post("/api/paiement/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend GestionCours Pro opérationnel." });
});

app.use("/api/auth", authRoutes);
app.use("/api/membres", membresRoutes);
app.use("/api/cours", coursRoutes);
app.use("/api/ecolage", ecolageRoutes);
app.use("/api/paiement", paymentRoutes);
app.use("/api/presence", presenceRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/admin", adminRoutes);

export default app;
