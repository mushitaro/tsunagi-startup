# CLAUDE.md

tsunagi 統合サイト（Astro 5 + Cloudflare Workers）。

- **コンテンツの追加・編集・デプロイ手順** → [AGENTS.md](./AGENTS.md)
- **環境セットアップ** → [README.md](./README.md)

## ブランド表記ルール

- ブランド名は必ず **TSUNAGI**（全大文字）。`tsunagi` と小文字で書かない。
- URL・ファイル名・変数名（`tsunagi.app`、`tsunagi-stocks` など）はこの限りでない。

## 要点

- コンテンツは `src/content/`（apps = YAML、articles / consulting = MDX）。フロントマターは `src/content.config.ts` の Zod スキーマで検証される。
- 日本語が既定ロケール、英語は `/en/` 配下。ja・en の記事は同じファイル名（slug）で対応づく。
- 有料記事は `access: paid` + `price`（日本円整数）。本文は未購入ユーザーに出力されない。
- バインディングは SSR コード内で `Astro.locals.runtime.env` から取得する（`@astrojs/cloudflare` v12）。
- 検証: `npm run dev`（プレビュー） / `npm run build`（型チェック + ビルド）。
- `dist/`・`.wrangler/` は生成物。シークレットはコミットしない。
