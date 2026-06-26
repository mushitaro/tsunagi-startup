# tsunagi 統合サイト

`tsunagi.app`（apex）を入り口とする tsunagi の統合サイト。3セクション構成：

- **TSUKURU**（`/tsukuru`） — アプリ・開発中リポジトリのポートフォリオ
- **TSUTAERU**（`/tsutaeru`） — 記事。Stripe による記事単位課金（アカウント方式）
- **TSUNAGU**（`/tsunagu`） — アプリのデザイン・開発・運用受託。問い合わせは Discord

日本語が既定、英語版は `/en/` 配下。SEO / AIO（`llms.txt`・構造化データ・サイトマップ）対応。

## 技術スタック

- **Astro 5**（静的優先 + 一部 SSR）/ **TypeScript**
- **Cloudflare Workers**（`@astrojs/cloudflare` v12 アダプタ）
- **Cloudflare D1** — ユーザー・購入権・マジックリンク・レート制限
- **Tailwind CSS v4**（PostCSS 経由）
- **Stripe**（Checkout + Webhook、REST API を fetch で直接利用）
- **Resend** — マジックリンク / レシートメール
- **Discord Webhook** — 問い合わせ通知

## 必要なもの

Node.js 22+ / Cloudflare アカウント / Stripe アカウント / Resend アカウント / Discord（Webhook と招待リンク）

## 初回セットアップ

```sh
npm install

# 1. D1 データベースを作成 → 出力された database_id を wrangler.jsonc に貼る
npx wrangler d1 create tsunagi_db

# 2. セッション用 KV を作成 → 出力された id を wrangler.jsonc に貼る
npx wrangler kv namespace create SESSION

# 3. マイグレーション適用（ローカル / 本番）
npm run db:migrate:local
npm run db:migrate:remote

# 4. ローカル開発用シークレット
cp .dev.vars.example .dev.vars   # 中身を実値に編集

# 5. 本番シークレットを Worker に登録
npx wrangler secret put SESSION_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put DISCORD_WEBHOOK_URL
```

`wrangler.jsonc` の `vars`（`PUBLIC_SITE_URL` / `RESEND_FROM` / `DISCORD_INVITE_URL`）も実値に編集する。

### Stripe Webhook

Stripe ダッシュボードで Webhook エンドポイントを追加：

- URL: `https://tsunagi.app/api/stripe-webhook`
- イベント: `checkout.session.completed`
- 署名シークレット（`whsec_...`）を `STRIPE_WEBHOOK_SECRET` に設定

記事の価格はフロントマターの `price`（日本円の整数）で指定し、Stripe 側に商品登録は不要。

## 開発

```sh
npm run dev      # http://localhost:4321
```

`platformProxy` によりローカルでも D1 が使える（事前に `npm run db:migrate:local`）。

## ビルド / デプロイ

```sh
npm run build    # astro check + astro build
npm run deploy   # ビルドして wrangler deploy
```

`main` への push で GitHub Actions が自動デプロイ（`.github/workflows/deploy.yml`）。
そのため GitHub リポジトリに以下の Secrets を登録する：

- `CLOUDFLARE_API_TOKEN`（Workers 編集権限）
- `CLOUDFLARE_ACCOUNT_ID`

PR を作るとプレビュー版がアップロードされる（`preview.yml`）。

## 独自ドメイン

Cloudflare ダッシュボードで Worker に `tsunagi.app`（apex）のカスタムドメインを割り当てる（CNAME フラット化）。`startup.tsunagi.app`（TSUNAGI App の LP）はこの Worker とは別系統で、変更しない。

## コンテンツの追加・運用

記事・アプリ・コンサル項目の追加方法は **[AGENTS.md](./AGENTS.md)** を参照。

## 旧サイトからの移行

- note.com の記事は `src/content/articles/ja/` にスタブを用意済み（`draft: true`）。
  note 本文を貼り付けて `draft` を外すと公開される。
- 旧 URL を引き継ぐ場合は `public/_redirects` に 301 を追記する。
