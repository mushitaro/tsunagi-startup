# automation — SNS半自動配信パイプライン

「**人間＝真実と洞察の源泉、AI＝配信と増幅のエンジン**」という役割分担で集客を回すための仕組み。
旗艦コンテンツ（種）は人間が書き、AIがそれを各SNS向け投稿へ"増幅"する。投稿前に必ず人間が承認する。

サイト本体（Astro）とは独立した、**依存ゼロの Node スクリプト**（Node 22+）。ビルドには一切影響しない。

## 全体フロー（半自動）

```
1. 種を書く      automation/seeds/<date>-<slug>.md   ← 人間（核となる洞察・一次情報）
2. 増幅          node automation/generate-social-drafts.mjs
                 → automation/queue/ に各SNSのドラフト生成（status: pending）
3. 承認          各ドラフトを確認・加筆し status: pending → approved に変更（人間）
4. 投稿          node automation/post-approved.mjs
                 → approved のみ各SNSへ投稿し status: posted に更新
```

## チャネル割当（`config.json`）

| チャネル | アカウント | 自動化の実情 |
|---|---|---|
| X | tsunagi.app | 公式APIで投稿可（無料枠は月間上限）。`X_ACCESS_TOKEN` が必要 |
| Threads | m3.tsunagi.app | 公式APIで承認後の自動投稿まで可。`THREADS_ACCESS_TOKEN` / `THREADS_USER_ID` |

## 種(seed)ファイルの書式

```markdown
---
title: 記事タイトル
url: https://tsunagi.app/tsutaeru/xxx   # 誘導先URL（必須）
lang: ja
channels: [x, threads]                  # 省略時は config の有効チャネル全部
tags: [タグ1, タグ2]
---
ここに人間が書いた核となる本文（種）。ここからAIが各SNS投稿を生成する。
```

## 生成モード

- `ANTHROPIC_API_KEY` があれば **Claude で生成**（`ANTHROPIC_MODEL` で上書き可、既定 `claude-sonnet-5`）。
- 無ければ **決定的テンプレート**にフォールバック（キー無しでも必ず動く）。
- `NO_LLM=1` で強制的にテンプレートのみ。

## 必要なシークレット（すべて GitHub Actions Secrets / ローカルは環境変数。コミット厳禁）

| 変数 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | 投稿文のAI生成（任意） |
| `X_ACCESS_TOKEN` | X 投稿（tweet.write スコープの OAuth2 ユーザートークン） |
| `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID` | Threads 投稿 |

> LinkedIn（HOSHUTARO側）は個人プロフィールへのAPI自動投稿が審査上むずかしいため、
> `hoshutaro-delivery` 側では承認後にスケジューラ/手動投稿を想定（同フローの `status: approved` をトリガーに運用）。

## GitHub Actions

- `.github/workflows/social-drafts.yml` — 週次＋手動。生成 → ブランチに commit → PR を作成（人間が承認）。
- `.github/workflows/social-post.yml` — 手動＋日次。`post-approved.mjs` を実行（シークレットが無いチャネルは自動スキップ）。

## ローカル確認

```sh
NO_LLM=1 node automation/generate-social-drafts.mjs   # キー不要で動作確認
DRY_RUN=1 node automation/post-approved.mjs            # 投稿対象の確認だけ
```
