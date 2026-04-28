import { checkAbsencesAndAlert } from "../controllers/presence.controller.js";

export async function runPresenceAbsenceAlerts() {
  await checkAbsencesAndAlert();
}
