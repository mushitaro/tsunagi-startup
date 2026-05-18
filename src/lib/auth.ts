// 認証ユーティリティ。
// - セッション: HMAC-SHA256 署名付き Cookie（ステートレス、KV 不要）
// - マジックリンク: ランダムトークンを発行し、ハッシュを D1 に保存（ワンタイム）
// すべて Web Crypto（workerd / ブラウザ両対応）で実装。

export interface SessionUser {
  id: string;
  email: string;
}

export const SESSION_COOKIE = 'tsg_session';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30日
export const MAGIC_LINK_TTL_SEC = 60 * 30; // 30分

const encoder = new TextEncoder();

/* ── base64url ───────────────────────────────────── */
function bytesToB64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/* ── セッショントークン ──────────────────────────── */
export async function createSessionToken(user: SessionUser, secret: string): Promise<string> {
  const payload = {
    uid: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  };
  const body = bytesToB64url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(body));
  return `${body}.${bytesToB64url(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<SessionUser | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    b64urlToBytes(sig),
    encoder.encode(body),
  );
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body)));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    if (typeof payload.uid !== 'string' || typeof payload.email !== 'string') return null;
    return { id: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = SESSION_TTL_SEC) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}

/* ── マジックリンクトークン ──────────────────────── */
/** リンクに埋め込む推測不能なトークンを生成する。 */
export function generateMagicToken(): string {
  return bytesToB64url(crypto.getRandomValues(new Uint8Array(32)));
}

/** D1 に保存するためのトークンハッシュ（平文は保存しない）。 */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── メール検証 ──────────────────────────────────── */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
