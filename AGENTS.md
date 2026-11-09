# AGENTS.md — TSUNAGI 統合サイト 運用ガイド

このリポジトリは `tsunagi.app`（apex）を入り口とする TSUNAGI の統合サイト（TSUKURU / TSUTAERU / TSUNAGU）です。
サーバー機能を持たない静的サイトで、GitHub Pages で公開しています。
AIエージェントがコンテンツ作成・プレビュー・修正・デプロイを行うことを前提に構成しています。

## このサイトの構成

- **TSUKURU**（`/tsukuru`）: アプリ・開発中リポジトリのポートフォリオ
- **TSUTAERU**（`/tsutaeru`）: 記事
- **TSUNAGU**（`/tsunagu`）: 進め方の思想と提供形態（オープン標準 MOYAI・商用コア IP のライセンス・戦略的アライアンス）。個別の受託開発や PoC の請負は行わない。問い合わせは Discord への招待リンク

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
5. 任意で `video`（紹介動画の題名と URL）と `editions`（エディションの名前・札・説明）を足すと、詳細ページに出る。書き方はテンプレートのコメントを参照。YouTube の URL なら、プライバシー強化モード（youtube-nocookie.com）で埋め込まれる。
6. `thumbnail` はカードの主画像。製品の顔になる場面（製品サイトのヒーロー、紹介動画の一場面など）を 1280×720 に切り出し、`public/images/apps/<slug>-ja.png`・`<slug>-en.png` に置いて `{ ja, en }` で書く（言語で替えないなら文字列 1 つでよい）。カードでは 16:9、詳細ページでは 2:1 に切り取られ、OG 画像にもなる。
7. `icon` は名前の左に出す製品のアイコン。製品のしるしを、地（背景の四角）を外して製品の色のまま `public/images/apps/<slug>-icon.svg`（または `.png`）に置く。サイトは暗い地なので、黒いしるしは明るい色（#e0e0e0）にし、暗い地向けの版があればそれを使う。
8. `nameFont` は名前の字体。製品のサイトやロゴで使っている書体を、Google Fonts の書体名・太さ・字間で書く（例：MOYAI は Krona One・400・0.18em）。カードと詳細ページの名前に使い、名前に出る字だけを読み込む。

掲載をやめたアプリの URL は、`astro.config.mjs` の `redirects` で後継のページへ転送する（例：`/tsukuru/hoshutaro` → `/tsukuru/moyai`）。

### 記事を追加する（TSUTAERU）

1. `src/content/_templates/article.example.mdx` を `src/content/articles/ja/<slug>.mdx` にコピー。
2. 英語版は `src/content/articles/en/<slug>.mdx` に**同じ `<slug>`** で作成（言語切替で対応づく）。
3. `summary` は必ず記入（一覧・SEO・AIO に使われる）。
4. 執筆中は `draft: true`。本番では非公開、`npm run dev` では表示される。

> スキーマには `access: paid` / `price` が残っているが、課金機能はない。`paid` にすると本文は出力されず `summary` だけが表示される（将来用）。通常は指定しない。

### 提供範囲を編集する（TSUNAGU）

`src/content/consulting/{ja,en}/<slug>.mdx`。`title`（見出し）/ `summary`（リード）/ `order`（表示番号）/ 本文。`icon` は描画に使っていないので、中身を表す短い文字列でよい（今は `open` / `license` / `alliance`）。

「進め方」の 4 段落（「受託でよくある失敗って…」から始まる）は TSUNAGI の核の思想なので、文言を変えない。全文は TSUTAERU の記事 `src/content/articles/{ja,en}/how-we-work.mdx` に置き、TSUNAGU（`ConsultingView.astro`）には見出しと提供形態の段落、その記事への導線だけを置く。提供形態の説明は、その段落・提供範囲・FAQ で書く。

### 非公開にする

掲載をやめたアプリや記事は `src/content/_archive/`（`.gitignore` 済み）へ移す。ビルドにも push にも含まれず、手元にだけ残る。戻すときは元のフォルダへ移すだけ。

### 画像

`public/images/` 配下に置き、`/images/...` で参照する。

### デザインの決まり

色・書体・部品の決まりは、claude.ai のデザインシステム「TSUNAGI Design System」（https://claude.ai/artifact/FQsYv86nYMfbnPpjXEHrSR）にまとめてある。正本はこのリポジトリの `src/styles/global.css`。書体は役割で分ける。

- 毛筆（`font-display`）＝印。トップの句と、作・伝・繋の一字だけ。欧文・括弧の入る題・小さな字には使わない。
- 明朝（`font-mincho`）＝題。h1〜h4 の既定、三つの営みの欧文名、ナビ。
- ゴシック（`font-sans`）＝文と操作。本文・ラベル・ボタン・FAQ・本文の中の見出し。
- 一覧ページの頭は `PageHead`（連番・印の一字・欧文名・リード）を使う。

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
