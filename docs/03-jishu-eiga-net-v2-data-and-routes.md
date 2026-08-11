# 自主映画ねっと V2 データ・ルート設計

Version 2.0 / 2026-08-11

## 方針

既存の CINEVERSE TOWN、季節演出、広告街区、映画監督になろうへの導線を維持する。映画、監督、国、ジャンル、インタビュー、記事は `assets/film-data.js` の共通データから表示し、タウンとデータベースを同じ作品群で接続する。

データベースや外部APIは未接続であるため、すべての画面でデモデータであることを明示する。実在作品や実在人物の情報を推測で表示しない。

## 静的ルート

GitHub Pages の `/project-cineverse/jishu-eiga-net/` 配下で直接開ける静的ファイルを使う。

| URL | 役割 |
| --- | --- |
| `/jishu-eiga-net/` | CINEVERSE TOWN とランダム発見 |
| `/jishu-eiga-net/films/` | 検索・複合フィルター・並び替え |
| `/jishu-eiga-net/films/[slug]/` | 作品詳細 |
| `/jishu-eiga-net/countries/` | 国別一覧 |
| `/jishu-eiga-net/genres/` | ジャンル別一覧 |
| `/jishu-eiga-net/directors/` | 監督一覧 |
| `/jishu-eiga-net/directors/[slug]/` | 監督詳細 |
| `/jishu-eiga-net/interviews/` | インタビュー一覧 |
| `/jishu-eiga-net/interviews/[slug]/` | インタビュー詳細 |
| `/jishu-eiga-net/features/` | 特集・制作記事 |

作品、国、ジャンルの絞り込みは静的ルートの制約に合わせ、`/films/?country=KR` のようなクエリで共有する。

## 共通データモデル

### Movie

`id`, `slug`, `title`, `originalTitle`, `translatedDescription`, `originalDescription`, `summary`, `countryCode`, `genreIds`, `releaseYear`, `durationMinutes`, `originalLanguage`, `subtitleLanguages`, `directorId`, `poster`, `youtubeVideoId`, `youtubeUrl`, `tags`, `featured`, `townFeatured`, `season`, `publishedAt`, `status`, `translationStatus`, `summaryStatus`, `humanReviewed` を持つ。

### Director

`id`, `slug`, `name`, `romanName`, `countryCode`, `photo`, `bio`, `officialWebsite`, `socialLinks` を持つ。写真や公式リンクが未登録の場合は、プレースホルダーまたは非表示にする。

### Country / Genre

国とジャンルのマスタ情報は映画データと結び、一覧の作品数は公開中の映画から動的に計算する。画面側で固定件数や固定の対象国を前提にしない。

### Interview / Article

インタビューは `directorId`、`movieId`、`intro`、`questionsAndAnswers`、`publishedAt` を持つ。回答には将来の翻訳・編集のため `originalAnswer`、`translatedAnswer`、`editedAnswer` を分離できる構造を採る。

## 公開・AI・許可への備え

映画の `status` は将来 `discovered`、`review_pending`、`permission_granted`、`translation_pending`、`editorial_review`、`ready_to_publish`、`published`、`archived` などへ接続できるようにする。掲載許可は次フェーズで Permission / PublicationRequest の独立データへ分離する。

YouTube URL が未登録の場合は埋め込みを作らない。AIによる翻訳・要約は公開前の人による確認を前提にし、内部の進行状態を一般画面へ過度に表示しない。
