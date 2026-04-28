export async function simulateForumNotification(payload) {
  console.log("🔔 [NOTIFICATION FORUM SIMULÉE]");
  console.log(JSON.stringify(payload, null, 2));
  return { success: true, simulated: true };
}
