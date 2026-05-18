-- tsunagi D1 初期スキーマ
-- 適用: ローカル `npm run db:migrate:local` / 本番 `npm run db:migrate:remote`

-- ユーザー（メール検証後にのみ作成される）
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  INTEGER NOT NULL
);

-- マジックリンクトークン（平文は保存せずハッシュのみ・ワンタイム）
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash  TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  expires_at  INTEGER NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_email ON auth_tokens (email);

-- 購入権（記事 slug 単位。ja/en は同一 slug を共有し1購入で両言語解放）
CREATE TABLE IF NOT EXISTS purchases (
  id                     TEXT PRIMARY KEY,
  user_id                TEXT NOT NULL,
  article_slug           TEXT NOT NULL,
  stripe_session_id      TEXT NOT NULL UNIQUE,
  stripe_payment_intent  TEXT,
  amount                 INTEGER,
  currency               TEXT,
  created_at             INTEGER NOT NULL,
  UNIQUE (user_id, article_slug)
);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases (user_id);

-- レート制限（固定ウィンドウ）
CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL
);
