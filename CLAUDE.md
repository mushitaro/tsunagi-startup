# CLAUDE.md

TSUNAGI 統合サイト（Astro 5 の静的サイト + GitHub Pages）。

- **コンテンツの追加・編集・デプロイ手順** → [AGENTS.md](./AGENTS.md)
- **環境セットアップ** → [README.md](./README.md)

## ブランド表記ルール

- ブランド名は必ず **TSUNAGI**（全大文字）。`tsunagi` と小文字で書かない。
- URL・ファイル名・変数名（`tsunagi.app`、`tsunagi-stocks` など）はこの限りでない。

## 要点

- サーバー機能なし（決済・認証・DB・フォームはない）。2026-06 に Cloudflare Workers 構成から移行済み。
- コンテンツは `src/content/`（apps = YAML、articles / consulting = MDX）。フロントマターは `src/content.config.ts` の Zod スキーマで検証される。
- 日本語が既定ロケール、英語は `/en/` 配下。ja・en の記事は同じファイル名（slug）で対応づく。
- `main` への push で GitHub Actions が GitHub Pages にデプロイする。
- 検証: `npm run dev`（プレビュー） / `npm run build`（型チェック + ビルド）。
- `dist/` は生成物。シークレットはコミットしない。
