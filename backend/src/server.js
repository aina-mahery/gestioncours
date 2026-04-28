import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";
import { startFinanceRemindersCron } from "./jobs/reminders.cron.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connexion PostgreSQL établie");
    startFinanceRemindersCron();
    app.listen(PORT, () => {
      console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur :", error);
    process.exit(1);
  }
}

startServer();
