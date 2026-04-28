export async function sendSmsMock({ to, message }) {
  console.log("📱 [SIMULATION SMS / TWILIO]");
  console.log(JSON.stringify({ to, message }, null, 2));
  return { success: true, simulated: true, channel: "sms" };
}

export async function sendEmailMock({ to, subject, body }) {
  console.log("📧 [SIMULATION EMAIL]");
  console.log(JSON.stringify({ to, subject, body }, null, 2));
  return { success: true, simulated: true, channel: "email" };
}
