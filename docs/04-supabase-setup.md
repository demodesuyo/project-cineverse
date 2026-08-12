# 自主映画ねっと Supabase セットアップ

Version 3.0 / 2026-08-12

## 構成

自主映画ねっとは静的なGitHub Pagesサイトのまま、ブラウザからSupabase Data APIへ読み取り専用で接続する。公開されるのはSupabaseの **Publishable key** のみであり、アクセスの安全性はRLSと最小権限のpolicyで確保する。

`service_role`、`sb_secret_...`、DBパスワード、接続文字列は、ブラウザ・GitHub Variables・リポジトリへ絶対に置かない。

## 1. Supabase Projectを作成

Supabase Dashboardで新しいProjectを作成する。Project URLと、クライアント用のPublishable keyを控える。古いProjectでPublishable keyが無い場合だけ、legacy `anon` keyを一時的に使えるが、新規構成ではPublishable keyを使用する。

## 2. migrationを実行

SQL EditorまたはSupabase CLIで、次の順に実行する。

1. `supabase/migrations/20260812000100_cineverse_schema.sql`
2. `supabase/seed.sql`（接続確認用。実在作品のデータではない）

SQL Editorを使う場合は、migrationの内容を貼り付けて一度実行し、その後seedを実行する。

## 3. RLSを確認

SQL Editorで次を確認する。

```sql
-- 公開サンプルだけが見えること
select slug, status from public.movies;

-- 匿名アクセス用policyが存在すること
select tablename, policyname from pg_policies where schemaname = 'public';
```

ブラウザの匿名APIでは、`sample-film-a`は取得でき、`sample-film-draft`、`publication_permissions`、`discovery_candidates`は取得できない状態にする。

## 4. ローカル環境変数を設定

`.env.example`を参考に、Gitへ追加しない`.env.local`を作成する。

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

静的配信用artifactを作る。

```powershell
node scripts/build-pages.mjs
```

その後、`dist`を任意の静的サーバーで開く。環境変数が無い場合は、既存の架空サンプル画面を安全に表示し、サイトはクラッシュしない。

## 5. GitHub PagesをGitHub Actionsへ切り替え

このProjectはbuild時に公開設定を注入するため、GitHubのリポジトリ画面で **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に変更する。

リポジトリの **Settings → Secrets and variables → Actions → Variables** に、次のRepository Variablesを作成する。

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

これは公開クライアント用設定で、ブラウザの配信物にも含まれる。安全性はRLSで担保する。Secret keyやservice role keyはVariables/Secretsを問わずこのworkflowへ設定しない。

`main`へpushすると`.github/workflows/deploy-pages.yml`が`dist`を作り、GitHub Pagesへdeployする。

## 実データを登録する前の確認

1. `movies.status`を`published`にする。
2. `published_at`を現在以前に設定する。
3. `editorial_status`を`approved`にする。
4. 国・監督・ジャンルを紐づける。
5. 掲載許可や連絡先は`publication_permissions`で内部管理し、公開画面には入れない。
6. YouTube埋め込みは許可済みの公式URLまたはvideo IDだけを登録する。

## 静的ルーティングの注意

Supabaseに新しいslugの作品を登録しても、GitHub Pagesへファイルを増やす必要はない。接続後の映画カードは`/jishu-eiga-net/film.html?slug=...`、監督とインタビューは同様の共通詳細ページへ移動する。

`get_random_published_movie_id()`は今回の小規模データ向けで、DB内で1件を選ぶ。データ量が大きくなった第4回では、ランダム用の索引またはサンプルテーブルへ置き換える。
