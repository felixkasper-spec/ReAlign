import "server-only";
import crypto from "node:crypto";

function sign(userId: string): string {
  return crypto
    .createHmac("sha256", process.env.UNSUBSCRIBE_SECRET!)
    .update(userId)
    .digest("base64url");
}

export function unsubscribeUrl(baseUrl: string, userId: string): string {
  const token = sign(userId);
  return `${baseUrl}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${token}`;
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = Buffer.from(sign(userId));
  const provided = Buffer.from(token);
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}
