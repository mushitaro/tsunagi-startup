# AGENTS.md — TSUNAGI 統合サイト 運用ガイド

このリポジトリは `tsunagi.app`（apex）を入り口とする TSUNAGI の統合サイト（TSUKURU / TSUTAERU / TSUNAGU）です。
サーバー機能を持たない静的サイトで、GitHub Pages で公開しています。
AIエージェントがコンテンツ作成・プレビュー・修正・デプロイを行うことを前提に構成しています。

## このサイトの構成

- **TSUKURU**（`/tsukuru`）: アプリ・開発中リポジトリのポートフォリオ
- **TSUTAERU**（`/tsutaeru`）: 記事
- **TSUNAGU**（`/tsunagu`）: アプリのデザイン・開発・運用受託。問い合わせは Discord への招待リンク

日本語が既定。英語版は各 URL の `/en/` 配下（例: `/en/tsukuru`）。

決済・認証・データベース・問い合わせフォームはありません。追加する場合は静的ホスティングの前提が変わるので、必ず利用者に確認してください。

## コンテンツの追加・編集（ここが主な作業）

コンテンツはすべて `src/content/` 配下のファイル。**1ファイル追加・編集 → プレビュー → push** が基本フロー。
フロントマターは Zod スキーマ（`src/content.config.ts`）で検証され、誤りはビルド時にエラーになる。

### アプリを追加する（TSUKURU）

1. `src/content/_templates/app.example.yaml` を `src/content/apps/<slug>.yaml` にコピー。
2. ファイル名 `<slug>` がそのまま URL（`/tsukuru/<slug>`）になる。
3. `name` / `tagline` / `description` は ja・en 両方を記入。`status` は `live` / `in-development` / `planned`。
4. 並び順と表示番号は `order`（1 が先頭で「01」と表示される）。

### 記事を追加する（TSUTAERU）

1. `src/content/_templates/article.example.mdx` を `src/content/articles/ja/<slug>.mdx` にコピー。
2. 英語版は `src/content/articles/en/<slug>.mdx` に**同じ `<slug>`** で作成（言語切替で対応づく）。
3. `summary` は必ず記入（一覧・SEO・AIO に使われる）。
4. 執筆中は `draft: true`。本番では非公開、`npm run dev` では表示される。

> スキーマには `access: paid` / `price` が残っているが、課金機能はない。`paid` にすると本文は出力されず `summary` だけが表示される（将来用）。通常は指定しない。

### 受託のサービス項目を編集する（TSUNAGU）

`src/content/consulting/{ja,en}/<slug>.mdx`。`title` / `summary` / `order` / `icon`（`design` / `build` / `operate`）。

### 非公開にする

掲載をやめたアプリや記事は `src/content/_archive/`（`.gitignore` 済み）へ移す。ビルドにも push にも含まれず、手元にだけ残る。戻すときは元のフォルダへ移すだけ。

### 画像

`public/images/` 配下に置き、`/images/...` で参照する。

## プレビュー

```sh
npm run dev      # http://localhost:4321 — draft 記事も表示される
```

## デプロイ

`main` ブランチへ push すると GitHub Actions（`.github/workflows/deploy.yml`）が
静的ビルド（`npm run build`）→ GitHub Pages への公開を自動実行する。

## やってはいけないこと

- `src/content/apps/`・`articles/`・`consulting/` 配下にテンプレートや下書き以外の不要ファイルを置かない（コレクションに取り込まれる）。
- シークレットやトークン（SNS 配信用など）をリポジトリにコミットしない。
- `dist/` を編集しない（ビルド生成物）。

## セットアップ

`README.md` を参照。
