# Supabase Connect と GitHub Pages

Version 3.1 / 2026-08-28

この静的サイトは、GitHub Pages のビルド時に公開用のSupabase設定を
`assets/runtime-config.js` へ生成します。URLとPublishable keyはブラウザへ
配信されますが、公開できるデータはSupabaseのRLSポリシーで制御されます。

## 使用する環境変数

Supabase Connect画面の名前をそのまま使用します。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

これらはGitHubの **Repository Variables** に設定します。GitHub Pagesの成果物に
含まれる公開用設定なので、SecretsではなくVariablesで管理します。

`sb_secret_...`、`service_role` key、Database Password、接続文字列は、この
リポジトリ・GitHub Variables・GitHub Secrets・ブラウザのいずれにも設定しません。

## デプロイの流れ

1. `main` へのpushで `.github/workflows/deploy-pages.yml` が起動します。
2. GitHub Variablesを環境変数として `scripts/build-pages.mjs` に渡します。
3. ビルドは `dist/` に公開用ファイルだけを生成します。
4. GitHub Actionsが `dist/` をGitHub Pagesへ配信します。
5. ブラウザはPublishable keyでSupabase Data APIへ接続します。

## 公開の条件

`sample-film-a` は `status = 'published'` かつ `published_at <= now()` のため、
RLSを通過して表示されます。`sample-film-draft` は `status = 'draft'` のため、
公開APIでは取得できず、作品数にも含まれません。

既存の `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` は、以前の設定がある場合だけ
互換用として読み取ります。新規設定では必ず `NEXT_PUBLIC_*` を使用してください。
