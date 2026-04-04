/**
 * Unsubscribe token generation and verification.
 * Uses HMAC-SHA256 to sign org IDs for tamper-proof email unsubscribe links.
 *
 * Token format: orgId.hmacSignature (first 16 hex chars of HMAC)
 * No expiry — unsubscribe links must always work per CAN-SPAM.
 */

import { createHmac } from "crypto";

const HMAC_ALGO = "sha256";
const SIGNATURE_LENGTH = 16; // 16 hex chars = 8 bytes, enough to prevent brute force

function getSecret(): string {
  return process.env.ENCRYPTION_KEY || "zikit-unsubscribe-fallback-key";
}

/**
 * Generate a signed unsubscribe token for an organization.
 */
export function generateUnsubscribeToken(orgId: string): string {
  const hmac = createHmac(HMAC_ALGO, getSecret());
  hmac.update(orgId);
  const signature = hmac.digest("hex").slice(0, SIGNATURE_LENGTH);
  return `${orgId}.${signature}`;
}

/**
 * Verify an unsubscribe token and extract the orgId.
 * Returns the orgId if valid, null if tampered or malformed.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex <= 0) return null;

  const orgId = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  if (!orgId || !signature) return null;

  // Regenerate expected signature and compare
  const hmac = createHmac(HMAC_ALGO, getSecret());
  hmac.update(orgId);
  const expectedSignature = hmac.digest("hex").slice(0, SIGNATURE_LENGTH);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return null;

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return mismatch === 0 ? orgId : null;
}

/**
 * Generate the full unsubscribe URL for an organization.
 */
export function generateUnsubscribeUrl(orgId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zikit.ai";
  const token = generateUnsubscribeToken(orgId);
  return `${baseUrl}/api/v1/unsubscribe?token=${encodeURIComponent(token)}`;
}
