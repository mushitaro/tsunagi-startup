# 集客自動化（需要創出）システム提案書 — TSUNAGI / HOSHUTARO 共通基盤

> 目的: **最小の手間で最大の顧客**。同一オペレーターが運営する2ビジネスの「サイトへの流入＝注文の入口」を、
> 広告費ほぼ¥0・半自動で継続的に増やす。本書はマスター提案書（HOSHUTARO側は `hoshutaro-delivery/docs/` に接続ドキュメント）。

## 1. 現状と課題

| 項目 | TSUNAGI (`tsunagi.app`) | HOSHUTARO (`hoshutaro-delivery.tsunagi.app`) |
|---|---|---|
| ビジネス | スタジオ＋TSUNAGU受託＋ニッチアプリ群（M/整備アプリ/Design/Stocks） | 製造業向け設備保全AIエージェント（Maximo/CMMS/EAM） |
| 顧客 | B2B寄り＋ニッチB2C（E46 M3 等） | B2B・製造業・日本国内中心 |
| 集客の穴 | **流入計測ゼロ**、発信が散発的、記事4本が `draft` のまま | **流入計測ゼロ**、ブログ3本のみ、外部Googleフォーム頼み |

共通の本質的な穴：**「誰が・どのキーワードで来て・どこで離脱したか」が一切見えず、発信も手作業で属人的**。
`llms.txt`・構造化データ・sitemap という資産を持ちながら、AIO（AI検索最適化）を戦略化できていない。

## 2. 提案する仕組み：オーガニック需要創出エンジン（半自動・6本柱）

**設計原則**: 競合が薄く検索意図が濃いニッチ（設備保全B2B / E46 M3 等）に、
AIが編集フローに乗れる既存の静的サイト資産を使って、SEO＋AIO最適化コンテンツを量産・配信する。
オペレーターの稼働は「週1回の下書き承認」程度に抑える。

```
[計測] ──→ 勝ちキーワード発見 ──→ [プログラマティックSEO/記事] ──→ [SNS半自動配信] ──→ 流入増
   ↑                                                                                    │
   └──────────────────────── 週次ダイジェストで再計測（自己強化ループ）────────────────┘
```

1. **計測基盤（最優先）** — Google Search Console ＋ プライバシー配慮アナリティクス
   （両サイトとも Google Analytics 4。既に使う Search Console / Google Workspace と同一エコシステム）。全施策の羅針盤。
2. **AIO（AI検索最適化）＝最小手間・最大レバレッジ** — `llms.txt`・JSON-LD を強化（FAQ/HowTo/Product スキーマ）、
   「設備保全のExcel脱却ツールは？」「E46 M3のDMEコーディング方法」等にAIが答える時、サイトを引用させる。
   OSSである強み（GitHub README・Zenn/Qiita）を被引用ソースに。
3. **プログラマティックSEO** — データテーブル×テンプレートで掛け合わせLPを量産
   （「設備保全×業種」「E46 M3×整備項目」）。Astro `getStaticPaths` と好相性。
4. **コンテンツ制作＝人間×AIの役割分担** — 下記 §3。
5. **SNS運用の半自動化** — 本リポジトリの `automation/` に実装済み。下記 §4。
6. **被リンク・コミュニティ・シーディング（非スパム）** — OSSを活かした awesome-list 掲載・Discussion・比較記事掲載。

## 3. コンテンツの役割分担：人間＝洞察の源泉、AI＝増幅のエンジン

核となる洞察・一次情報・思想（E46 M3の整備勘、設備保全の現場感、TSUNAGIの思想）は
**AIが originate できない＝参入障壁**。ここを自動生成すると薄まり逆効果。よって：

- **人間（あなた）＝"種(seed)"を書く**。数は少なくてよい。これが moat。
- **AI＝増幅する**。種1本から ①各SNS投稿文 ②SEOメタ/構造化データ ③ja↔en翻訳
  ④FAQ/掛け合わせLP ⑤配信スケジュール ⑥週次アナリティクス要約 を生成。
- AI単独の下書きは補助（用語定義・How-To骨子・ニュースまとめ）に限定し、本人が加筆して公開。

## 4. SNS半自動配信パイプライン（本リポジトリ `automation/` に実装済み）

**チャネル割当**: m3.tsunagi.app＝**Threads** / tsunagi.app＝**X** / HOSHUTARO＝**LinkedIn**。

```
1. 種を書く   automation/seeds/<date>-<slug>.md   ← 人間
2. 増幅       node automation/generate-social-drafts.mjs → automation/queue/（status: pending）
3. 承認       status: pending → approved に変更（人間が加筆・可否判断）
4. 投稿       node automation/post-approved.mjs → approved のみ各SNSへ投稿し status: posted
```

- **依存ゼロのNodeスクリプト**でサイトのビルドに非干渉。`ANTHROPIC_API_KEY` があれば Claude 生成、無ければテンプレート。
- GitHub Actions：`social-drafts.yml`（週次＋手動で生成→PR）、`social-post.yml`（承認済みを投稿、シークレット無いチャネルは自動スキップ）。
- **各SNSの自動化の実情**（実装時に最新API上限・審査要件を要確認）：
  - Threads＝公式APIで承認後の自動投稿まで可。
  - X＝公式API（無料枠は月間上限）or Buffer/Typefully 等。
  - LinkedIn＝個人プロフィールへのAPI自動投稿は審査が厳しい → 承認後にスケジューラ/手動投稿が現実的。
- 詳細は [`automation/README.md`](../automation/README.md)。

## 5. 費用対効果 — なぜ「最小の手間で最大の顧客」か

- オーガニック中心で**広告費ほぼ¥0**。既存のAI編集可能な静的サイト資産をそのまま活用。
- 半自動なので本人稼働は「週1回の下書き承認」程度。**顔出し・個人発信は不要**（テキスト配信のみ）。
- ニッチは競合が薄く検索意図が濃い＝少数の記事で上位化しやすく**ROIが高い**。
- AIO は検索行動の変化を先取りする最小手間の先行投資。

## 6. 段階的ロールアウト

| Phase | 内容 | 目安 |
|---|---|---|
| A | 計測基盤（Search Console＋アナリティクス＋llms.txt/構造化データ強化） | 〜1日・最優先 |
| B | AIO＋プログラマティックSEO（掛け合わせLP量産） | 最大レバレッジ |
| C | SNS半自動配信の運用開始（**本PRで実装済み**：種→承認→投稿） | 稼働中 |
| D | 週次AIコンテンツ・パイプライン（種の増幅を記事/翻訳/LPへ拡張） | 継続 |
| E（任意） | 勝ち筋にだけ少額広告を後乗せして増幅 | 効果連動 |

## 7. 必要な設定（シークレット値はコミットしない）

- GitHub Actions Secrets：`ANTHROPIC_API_KEY`（任意）、`X_ACCESS_TOKEN`、`THREADS_ACCESS_TOKEN`、`THREADS_USER_ID`。
- 計測：Search Console のサイト登録、アナリティクスのトークン。

## 8. 想定KPI

表示回数 / クリック率（Search Console）、AI経由の参照流入、SNSエンゲージ→サイト流入、上位表示キーワード数、
そして最終的に問い合わせ・受注数。増えた流入を確実に受注へ変換するのが下流施策「Lead Engine（フォーム→CRM→予約）」。
