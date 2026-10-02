# TSUNAGI 統合サイト

`tsunagi.app`（apex）を入り口とする TSUNAGI の統合サイト。サーバー機能を持たない静的サイトで、GitHub Pages で公開している。3セクション構成：

- **TSUKURU**（`/tsukuru`） — アプリ・開発中リポジトリのポートフォリオ
- **TSUTAERU**（`/tsutaeru`） — 記事
- **TSUNAGU**（`/tsunagu`） — アプリのデザイン・開発・運用受託。問い合わせは Discord への招待リンク

日本語が既定、英語版は `/en/` 配下。SEO / AIO（`llms.txt`・構造化データ・サイトマップ）対応。

## 技術スタック

- **Astro 5**（静的ビルドのみ）/ **TypeScript** / **MDX**
- **Tailwind CSS v4**（PostCSS 経由）
- **GitHub Pages**（GitHub Actions でデプロイ）

決済・認証・データベース・問い合わせフォームは持たない（2026-06 に Cloudflare Workers 構成から静的サイトへ移行。削除したコードは git 履歴のコミット `1cd997b` に残っている）。

## 必要なもの

Node.js 22+

## 開発

```sh
npm install
npm run dev      # http://localhost:4321
```

## ビルド / デプロイ

```sh
npm run build    # astro check + astro build（出力は dist/）
npm run preview  # ビルド結果をローカルで確認
```

`main` への push で GitHub Actions（`.github/workflows/deploy.yml`）が静的ビルドして GitHub Pages に公開する。

計測タグはリポジトリの Variables から注入する（`src/components/Analytics.astro`）：

- `PUBLIC_GA4_ID` — GA4 測定 ID。未設定なら tsunagi.app の既定 ID を使う（GA4 は常に出力される）
- `PUBLIC_GSC_VERIFICATION` — Google Search Console の所有権確認。未設定ならタグを出力しない

詳細は [docs/measurement-setup.md](./docs/measurement-setup.md)。

## 独自ドメイン

`public/CNAME`（`tsunagi.app`）で GitHub Pages に apex ドメインを割り当てている。`startup.tsunagi.app`（TSUNAGI App の LP）はこのサイトとは別系統で、変更しない。

## コンテンツの追加・運用

記事・アプリ・受託サービス項目の追加方法は **[AGENTS.md](./AGENTS.md)** を参照。

## SNS 配信

`automation/` はサイト本体とは独立した SNS 半自動配信スクリプト（ビルドには影響しない）。使い方は [automation/README.md](./automation/README.md)。
