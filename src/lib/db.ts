// Cloudflare D1 アクセス層。スキーマは migrations/0001_init.sql を参照。

export interface UserRow {
  id: string;
  email: string;
  created_at: number;
}

export interface PurchaseRow {
  id: string;
  user_id: string;
  article_slug: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  amount: number | null;
  currency: string | null;
  created_at: number;
}

const now = () => Date.now();

/* ── users ───────────────────────────────────────── */
export async function getUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db.prepare('SELECT id, email, created_at FROM users WHERE email = ?').bind(email).first<UserRow>();
}

export async function getUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').bind(id).first<UserRow>();
}

/** メール基準で users を upsert し、確定した行を返す。 */
export async function upsertUserByEmail(db: D1Database, email: string): Promise<UserRow> {
  const row = await db
    .prepare(
      `INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET email = excluded.email
       RETURNING id, email, created_at`,
    )
    .bind(crypto.randomUUID(), email, now())
    .first<UserRow>();
  if (!row) throw new Error('upsertUserByEmail failed');
  return row;
}

/* ── auth_tokens（マジックリンク） ───────────────── */
export async function createAuthToken(
  db: D1Database,
  tokenHash: string,
  email: string,
  expiresAt: number,
): Promise<void> {
  await db
    .prepare('INSERT INTO auth_tokens (token_hash, email, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)')
    .bind(tokenHash, email, expiresAt, now())
    .run();
}

/** トークンが有効なら used=1 にして email を返す（ワンタイム・原子的）。 */
export async function consumeAuthToken(db: D1Database, tokenHash: string): Promise<string | null> {
  const row = await db
    .prepare(
      `UPDATE auth_tokens SET used = 1
       WHERE token_hash = ? AND used = 0 AND expires_at > ?
       RETURNING email`,
    )
    .bind(tokenHash, now())
    .first<{ email: string }>();
  return row?.email ?? null;
}

/** 直近 windowMs 以内に同一メール宛で発行したトークン数（リクエスト濫用対策）。 */
export async function countRecentAuthTokens(
  db: D1Database,
  email: string,
  windowMs: number,
): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) AS n FROM auth_tokens WHERE email = ? AND created_at > ?')
    .bind(email, now() - windowMs)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/* ── purchases（購入権） ─────────────────────────── */
/** 購入を記録する。新規挿入なら true、既存（冪等スキップ）なら false。 */
export async function recordPurchase(
  db: D1Database,
  p: {
    userId: string;
    articleSlug: string;
    stripeSessionId: string;
    stripePaymentIntent: string | null;
    amount: number | null;
    currency: string | null;
  },
): Promise<boolean> {
  // stripe_session_id と (user_id, article_slug) の UNIQUE 制約で冪等。
  const res = await db
    .prepare(
      `INSERT OR IGNORE INTO purchases
       (id, user_id, article_slug, stripe_session_id, stripe_payment_intent, amount, currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      p.userId,
      p.articleSlug,
      p.stripeSessionId,
      p.stripePaymentIntent,
      p.amount,
      p.currency,
      now(),
    )
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function hasPurchased(
  db: D1Database,
  userId: string,
  articleSlug: string,
): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 AS x FROM purchases WHERE user_id = ? AND article_slug = ? LIMIT 1')
    .bind(userId, articleSlug)
    .first<{ x: number }>();
  return !!row;
}

export async function getPurchases(db: D1Database, userId: string): Promise<PurchaseRow[]> {
  const res = await db
    .prepare('SELECT * FROM purchases WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<PurchaseRow>();
  return res.results ?? [];
}

/* ── rate_limits（固定ウィンドウ） ───────────────── */
/** key 単位の固定ウィンドウ制限。上限以内なら true。 */
export async function checkRateLimit(
  db: D1Database,
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start = excluded.window_start
                      THEN rate_limits.count + 1 ELSE 1 END,
         window_start = excluded.window_start
       RETURNING count`,
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}
