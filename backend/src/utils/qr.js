import crypto from "crypto";

export function generateQrToken(sessionId) {
  const raw = `${sessionId}-${Date.now()}-${crypto.randomUUID()}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}
