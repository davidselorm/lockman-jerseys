import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lockman_admin_session';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecretKey(): string {
  if (process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.trim().length >= 16) {
    return process.env.ADMIN_SESSION_SECRET.trim();
  }

  // Fallback to deterministic derived secret from email + password + internal salt
  const email = process.env.ADMIN_EMAIL || 'admin@lockmanjerseys.com';
  const password = process.env.ADMIN_PASSWORD || 'LockmanAdmin2025!';
  return crypto
    .createHash('sha256')
    .update(`${email}:${password}:lockman_jerseys_salt_2025_secure`)
    .digest('hex');
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface AdminTokenPayload {
  email: string;
  iat: number;
  exp: number;
  role: 'admin';
}

/**
 * Creates a cryptographically signed HMAC-SHA256 admin session token.
 */
export function createAdminToken(email: string): string {
  const secret = getSecretKey();
  const now = Date.now();
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: AdminTokenPayload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + TOKEN_MAX_AGE_MS,
    role: 'admin',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 admin session token.
 */
export function verifyAdminToken(token: string): { valid: boolean; email?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false };
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const secret = getSecretKey();

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length) {
    return { valid: false };
  }

  const isSigValid = crypto.timingSafeEqual(sigBuffer, expectedSigBuffer);
  if (!isSigValid) {
    return { valid: false };
  }

  try {
    const payload: AdminTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Date.now();

    if (now > payload.exp) {
      return { valid: false };
    }

    const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@lockmanjerseys.com').trim().toLowerCase();
    if (payload.email !== expectedEmail) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Server-side helper to check if current request has a valid admin session cookie.
 */
export async function getAdminSession(): Promise<{ authenticated: boolean; email?: string }> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) {
      return { authenticated: false };
    }

    const verification = verifyAdminToken(session.value);
    return {
      authenticated: verification.valid,
      email: verification.email,
    };
  } catch (err) {
    return { authenticated: false };
  }
}

export { COOKIE_NAME };
