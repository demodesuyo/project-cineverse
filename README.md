# Project CINEVERSE

世界中の映画をもっと自由に。

## Services

- 自主映画ねっと
- 映画監督になろう

## Mission

世界中の映画制作者と観客をつなぐ。

## Web prototype

2つの自主映画サービスの初期プロトタイプです。

- `jishu-eiga-net/index.html` — 世界の自主映画を紹介するメディア「自主映画ねっと」
- `eiga-kantoku/index.html` — 日本の制作者が作品を投稿する「映画監督になろう」

### 確認方法

`index.html` をブラウザで開くと、2サイトへの入口が表示されます。依存関係・ビルド作業は不要です。

### 現段階で含むもの

- モバイル対応の共通ナビゲーション
- サービス間の相互リンク
- 「自主映画ねっと」の作品・特集・ジャンル導線
- 「映画監督になろう」の作品一覧・投稿開始導線
- アカウント作成フォームの入力フィードバック（試作）

「自主映画ねっと」はSupabaseの公開映画データを読み取れる構成を備えています。接続情報が未設定の間は、既存の架空サンプルデータを安全に表示します。

### Supabase と GitHub Pages の設定

初心者向けの手順、migration、RLS確認、GitHub Pagesの設定は[Supabaseセットアップ](docs/04-supabase-setup.md)を参照してください。

- schema / RLS: `supabase/migrations/20260812000100_cineverse_schema.sql`
- 接続確認用の架空データ: `supabase/seed.sql`
- ローカル環境変数の雛形: `.env.example`
- Pages build: `node scripts/build-pages.mjs`

**service role key、secret key、DBパスワードは絶対にブラウザやGitへ置かないでください。**

設計方針は [Vision](docs/01-vision.md) を参照してください。
