# 計測基盤セットアップ — TSUNAGI

集客施策の「羅針盤」。**Google Search Console（検索クエリ）** と
**Google Analytics 4（流入・ページ計測）** を導入する。既に使う Search Console / Google Workspace と
同一エコシステムで新規ベンダー不要。実装済みで、あとは**IDを登録するだけ**で有効化される
（未登録なら計測タグは一切出力されない＝安全）。

## 仕組み

- `src/components/Analytics.astro` がビルド時の公開変数を見て `<head>` にタグを出力する。
  - `PUBLIC_GSC_VERIFICATION` → `<meta name="google-site-verification">`
  - `PUBLIC_GA4_ID` → Google Analytics 4（gtag.js）
- `BaseLayout.astro` が全ページで `<Analytics />` を読み込む。
- これらは **PUBLIC_ 接頭辞＝クライアントに露出する公開値**（シークレットではない）。

## 手順

### 1. Google Analytics 4
1. [GA4](https://analytics.google.com) でプロパティを作成し、Web データストリームに `tsunagi.app` を追加。
2. 発行された **測定ID**（`G-XXXXXXX`）を控える。

### 2. Google Search Console
1. [Search Console](https://search.google.com/search-console) で `tsunagi.app` を追加。
2. 「HTMLタグ」方式を選び、`content="..."` の**トークン部分**を控える。
   （ドメイン全体を登録したい場合は DNS TXT 方式でもよい。その場合 `PUBLIC_GSC_VERIFICATION` は不要。）

### 3. トークンを登録
GitHub リポジトリ → **Settings → Secrets and variables → Actions → Variables** に登録：

| 変数名 | 値 |
|---|---|
| `PUBLIC_GSC_VERIFICATION` | Search Console のトークン |
| `PUBLIC_GA4_ID` | GA4 の測定ID（`G-XXXXXXX`） |

`deploy.yml` のビルドステップがこれらを注入する。`main` へ push すると反映される。

### 4. 確認
- デプロイ後、ページのソースに `google-site-verification` メタと `googletagmanager.com/gtag/js` が出ていること。
- Search Console で「所有権の確認」を実行。
- ローカル確認は `.env`（`.env.example` をコピー）に値を入れて `npm run build && npm run preview`。

## 次の一手
Search Console の「表示回数は多いがクリックされないクエリ」が、記事・プログラマティックSEO・SNS種のネタ源になる。
