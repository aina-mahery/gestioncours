export async function simulateCourseCreationEmail({ nomCours, description, capacite }) {
  console.log("📧 [SIMULATION EMAIL COURS]");
  console.log(JSON.stringify({ to: "direction@ecole.fr", nomCours, description, capacite }, null, 2));
  return { success: true, simulated: true };
}
