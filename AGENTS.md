# AGENTS.md — tsunagi 統合サイト 運用ガイド

このリポジトリは `startup.tsunagi.app` を入り口とする tsunagi の統合サイト（Tsukuru / Tsutae / Tsunagu）です。
AIエージェントがコンテンツ作成・プレビュー・修正・デプロイを行うことを前提に構成しています。

## このサイトの構成

- **Tsukuru**（`/tsukuru`）: アプリ・開発中リポジトリのポートフォリオ
- **Tsutae**（`/tsutae`）: 記事。`access: paid` で Stripe による記事単位課金
- **Tsunagu**（`/tsunagu`）: アプリのデザイン・開発・運用受託。問い合わせは Discord

日本語が既定。英語版は各 URL の `/en/` 配下（例: `/en/tsukuru`）。

## コンテンツの追加・編集（ここが主な作業）

コンテンツはすべて `src/content/` 配下のファイル。**1ファイル追加・編集 → プレビュー → push** が基本フロー。
フロントマターは Zod スキーマ（`src/content.config.ts`）で検証され、誤りはビルド時にエラーになる。

### アプリを追加する（Tsukuru）

1. `src/content/_templates/app.example.yaml` を `src/content/apps/<slug>.yaml` にコピー。
2. ファイル名 `<slug>` がそのまま URL（`/tsukuru/<slug>`）になる。
3. `name` / `tagline` / `description` は ja・en 両方を記入。`status` は `live` / `in-development` / `planned`。

### 記事を追加する（Tsutae）

1. `src/content/_templates/article.example.mdx` を `src/content/articles/ja/<slug>.mdx` にコピー。
2. 英語版は `src/content/articles/en/<slug>.mdx` に**同じ `<slug>`** で作成（言語切替で対応づく）。
3. `summary` は必ず記入（一覧・SEO・AIO・有料記事の無料プレビューに使われる）。
4. 有料にする場合: `access: paid` と `price`（日本円の整数。例 `500` = ¥500）。
   ja・en が同じ `<slug>` なら、1回の購入で両言語が解放される。
5. 執筆中は `draft: true`。本番では非公開、`npm run dev` では表示される。

> 有料記事の本文は、未購入ユーザーには HTML として一切出力されない（`summary` のみ公開）。

### コンサルのサービス項目を編集する（Tsunagu）

`src/content/consulting/{ja,en}/<slug>.mdx`。`title` / `summary` / `order` / `icon`（`design` / `build` / `operate`）。

### 画像

`public/images/` 配下に置き、`/images/...` で参照する。

## プレビュー

```sh
npm run dev      # http://localhost:4321 — draft 記事も表示される
```

VSCode で `src/content/` を編集 → ブラウザが自動更新。

## デプロイ

`main` ブランチへ push すると GitHub Actions（`.github/workflows/deploy.yml`）が
ビルド → D1 マイグレーション → Cloudflare Workers へデプロイを自動実行する。
PR を作るとプレビュー版がアップロードされる（`preview.yml`）。

手動の場合: `npm run deploy`。

## やってはいけないこと

- `src/content/apps/`・`articles/`・`consulting/` 配下にテンプレートや下書き以外の不要ファイルを置かない（コレクションに取り込まれる）。
- シークレット（Stripe / Resend キー等）をリポジトリにコミットしない。ローカルは `.dev.vars`、本番は `wrangler secret put`。
- `dist/` ・ `.wrangler/` を編集しない（ビルド生成物）。

## セットアップ済みでない場合

`README.md` を参照（D1 / KV の作成、シークレット登録、独自ドメイン設定）。
