/*
 * CINEVERSE DEMO DATA
 * This file is deliberately shaped like the future API payload. Every record is
 * fictional UI data and must be replaced with reviewed creator-supplied data
 * before public editorial use.
 */
window.CINEVERSE_DATA = {
  isDemoData: true,
  countries: [
    { id: "jp", slug: "japan", code: "JP", name: "日本", region: "東アジア" },
    { id: "kr", slug: "south-korea", code: "KR", name: "韓国", region: "東アジア" },
    { id: "tw", slug: "taiwan", code: "TW", name: "台湾", region: "東アジア" },
    { id: "mx", slug: "mexico", code: "MX", name: "メキシコ", region: "北アメリカ" },
    { id: "tr", slug: "turkey", code: "TR", name: "トルコ", region: "西アジア" },
    { id: "fr", slug: "france", code: "FR", name: "フランス", region: "ヨーロッパ" },
    { id: "in", slug: "india", code: "IN", name: "インド", region: "南アジア" },
    { id: "br", slug: "brazil", code: "BR", name: "ブラジル", region: "南アメリカ" }
  ],
  genres: [
    { id: "drama", label: "DRAMA", name: "ドラマ" },
    { id: "comedy", label: "COMEDY", name: "コメディ" },
    { id: "sci-fi", label: "SCI-FI", name: "SF" },
    { id: "horror", label: "HORROR", name: "ホラー" },
    { id: "romance", label: "ROMANCE", name: "恋愛" },
    { id: "youth", label: "YOUTH", name: "青春" },
    { id: "documentary", label: "DOCUMENTARY", name: "ドキュメンタリー" },
    { id: "animation", label: "ANIMATION", name: "アニメーション" },
    { id: "experimental", label: "EXPERIMENTAL", name: "実験映画" },
    { id: "other", label: "OTHER", name: "その他" }
  ],
  directors: [
    { id: "director-kim-yoonji", slug: "kim-yoonji", name: "キム・ユンジ", romanName: "KIM YOONJI", countryCode: "KR", photo: null, bio: "音と都市の記憶を題材に、短編映画を制作する映像作家。", officialWebsite: null, socialLinks: [] },
    { id: "director-takahashi-makoto", slug: "takahashi-makoto", name: "高橋 真琴", romanName: "TAKAHASHI MAKOTO", countryCode: "JP", photo: null, bio: "日常の会話と小さな場所に流れる時間を見つめる映像作家。", officialWebsite: null, socialLinks: [] },
    { id: "director-lucia-lopez", slug: "lucia-lopez", name: "ルシア・ロペス", romanName: "LUCIA LOPEZ", countryCode: "MX", photo: null, bio: "都市の音と家族の関係をテーマに短編を手がける監督。", officialWebsite: null, socialLinks: [] },
    { id: "director-elif-demir", slug: "elif-demir", name: "エリフ・デミル", romanName: "ELIF DEMIR", countryCode: "TR", photo: null, bio: "土地に根ざした仕事と世代の選択を記録するドキュメンタリー作家。", officialWebsite: null, socialLinks: [] },
    { id: "director-lin-yao", slug: "lin-yao", name: "リン・ヤオ", romanName: "LIN YAO", countryCode: "TW", photo: null, bio: "夜の街と手描きの線から小さな冒険を描くアニメーション作家。", officialWebsite: null, socialLinks: [] },
    { id: "director-marie-durant", slug: "marie-durant", name: "マリー・デュラン", romanName: "MARIE DURANT", countryCode: "FR", photo: null, bio: "記録映像と再撮影を行き来しながら時間の手触りを探る映像作家。", officialWebsite: null, socialLinks: [] },
    { id: "director-anika-roy", slug: "anika-roy", name: "アニカ・ロイ", romanName: "ANIKA ROY", countryCode: "IN", photo: null, bio: "手紙と旅を通じて家族の距離を描くフィクション作品を制作する。", officialWebsite: null, socialLinks: [] },
    { id: "director-joao-silva", slug: "joao-silva", name: "ジョアン・シウバ", romanName: "JOAO SILVA", countryCode: "BR", photo: null, bio: "地域の人びとの声から気候と暮らしの変化を記録する監督。", officialWebsite: null, socialLinks: [] }
  ],
  movies: [
    { id: "movie-rain-after", slug: "rain-after", title: "雨のあとに聞こえること", originalTitle: "After the Rain, We Listen", translatedDescription: "雨が止んだソウルの路地で、音を録る女性は、何年も話していない父からの留守番電話を聞き返す。", originalDescription: null, summary: "都市の記憶と家族の距離を、雨上がりの環境音からたどる静かな短編ドラマ。", countryCode: "KR", genreIds: ["drama"], releaseYear: 2025, durationMinutes: 18, originalLanguage: "韓国語", subtitleLanguages: ["日本語"], directorId: "director-kim-yoonji", poster: { type: "placeholder", style: "rain" }, youtubeVideoId: null, youtubeUrl: null, tags: ["家族", "都市", "記憶"], featured: true, townFeatured: true, season: "spring", publishedAt: "2026-08-03", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: true },
    { id: "movie-quiet-afternoon", slug: "quiet-afternoon", title: "静かな午後", originalTitle: "A Quiet Afternoon", translatedDescription: "閉店間際の喫茶店。店主と常連客が交わす、いつもより少し長い午後の会話。", originalDescription: null, summary: "小さな店に流れる時間を通して、言葉にしない別れと優しさを描く短編。", countryCode: "JP", genreIds: ["drama"], releaseYear: 2025, durationMinutes: 22, originalLanguage: "日本語", subtitleLanguages: ["英語"], directorId: "director-takahashi-makoto", poster: { type: "placeholder", style: "quiet" }, youtubeVideoId: null, youtubeUrl: null, tags: ["会話", "喫茶店", "日常"], featured: true, townFeatured: true, season: "summer", publishedAt: "2026-07-20", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: true },
    { id: "movie-city-echoes", slug: "city-echoes", title: "街の残響", originalTitle: "Echoes of the City", translatedDescription: "夜の屋上で録音を続ける兄妹。遠くの街の音が、二人の新しい出発を後押しする。", originalDescription: null, summary: "騒がしい都市の中にある親密さと、旅立ちの一夜を軽やかに切り取った作品。", countryCode: "MX", genreIds: ["drama", "youth"], releaseYear: 2025, durationMinutes: 14, originalLanguage: "スペイン語", subtitleLanguages: ["日本語", "英語"], directorId: "director-lucia-lopez", poster: { type: "placeholder", style: "echo" }, youtubeVideoId: null, youtubeUrl: null, tags: ["兄妹", "音楽", "夜"], featured: false, townFeatured: true, season: "summer", publishedAt: "2026-07-08", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: true },
    { id: "movie-beyond-horizon", slug: "beyond-horizon", title: "地平線の向こう", originalTitle: "Beyond the Horizon", translatedDescription: "沿岸の町で漁を続ける一家と、海を離れようとする娘の一年を追う。", originalDescription: null, summary: "土地に根ざした仕事と世代ごとの選択を、海辺の季節とともに記録する作品。", countryCode: "TR", genreIds: ["documentary"], releaseYear: 2025, durationMinutes: 29, originalLanguage: "トルコ語", subtitleLanguages: ["日本語"], directorId: "director-elif-demir", poster: { type: "placeholder", style: "horizon" }, youtubeVideoId: null, youtubeUrl: null, tags: ["家族", "海", "仕事"], featured: false, townFeatured: true, season: "autumn", publishedAt: "2026-06-26", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: false },
    { id: "movie-blue-hour", slug: "blue-hour", title: "青の時間", originalTitle: "Blue Hour", translatedDescription: "夜明け前だけ姿を現す青い鳥を追いかける、ひとりの配達員のアニメーション。", originalDescription: null, summary: "手描きの線と街の光で、眠れない夜に訪れる小さな冒険を描くアニメーション。", countryCode: "TW", genreIds: ["animation"], releaseYear: 2024, durationMinutes: 9, originalLanguage: "中国語", subtitleLanguages: ["日本語"], directorId: "director-lin-yao", poster: { type: "placeholder", style: "blue" }, youtubeVideoId: null, youtubeUrl: null, tags: ["夜", "手描き", "幻想"], featured: false, townFeatured: true, season: "winter", publishedAt: "2026-06-02", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: false },
    { id: "movie-first-light", slug: "first-light", title: "最初の光", originalTitle: "First Light", translatedDescription: "古い8ミリフィルムに残る朝の光を、現在の街並みへ重ねていく映像作品。", originalDescription: null, summary: "記録と再撮影を行き来しながら、時間の手触りを探る実験的な短編。", countryCode: "FR", genreIds: ["experimental"], releaseYear: 2024, durationMinutes: 12, originalLanguage: "フランス語", subtitleLanguages: ["英語"], directorId: "director-marie-durant", poster: { type: "placeholder", style: "light" }, youtubeVideoId: null, youtubeUrl: null, tags: ["フィルム", "記録", "光"], featured: false, townFeatured: false, season: null, publishedAt: "2026-05-18", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: false },
    { id: "movie-monsoon-letter", slug: "monsoon-letter", title: "モンスーンの手紙", originalTitle: "Monsoon Letter", translatedDescription: "雨季の始まりに届いた一通の手紙が、母娘それぞれの旅を動かし始める。", originalDescription: null, summary: "離れて暮らす家族が、手紙と列車を通じて再び向き合うロードムービー。", countryCode: "IN", genreIds: ["drama", "romance"], releaseYear: 2024, durationMinutes: 26, originalLanguage: "ヒンディー語", subtitleLanguages: ["日本語"], directorId: "director-anika-roy", poster: { type: "placeholder", style: "monsoon" }, youtubeVideoId: null, youtubeUrl: null, tags: ["手紙", "旅", "母娘"], featured: false, townFeatured: false, season: null, publishedAt: "2026-04-11", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: false },
    { id: "movie-river-signs", slug: "river-signs", title: "川辺の標識", originalTitle: "Signs by the River", translatedDescription: "増水する川のそばで、住民たちは毎年つくり直す道案内の標識に町の記憶を刻む。", originalDescription: null, summary: "気候と暮らしの変化を、地域の人びとの声から見つめるドキュメンタリー。", countryCode: "BR", genreIds: ["documentary"], releaseYear: 2023, durationMinutes: 31, originalLanguage: "ポルトガル語", subtitleLanguages: ["英語"], directorId: "director-joao-silva", poster: { type: "placeholder", style: "river" }, youtubeVideoId: null, youtubeUrl: null, tags: ["地域", "気候", "川"], featured: false, townFeatured: false, season: null, publishedAt: "2026-03-09", status: "published", translationStatus: "demo", summaryStatus: "demo", humanReviewed: false, isNew: false }
  ],
  interviews: [
    { id: "interview-kim-listening", slug: "kim-yoonji-listening", directorId: "director-kim-yoonji", movieId: "movie-rain-after", title: "「撮ることで、故郷との距離を測っていた」", intro: "『雨のあとに聞こえること』のキム・ユンジ監督に、音と記憶について聞きました。", questionsAndAnswers: [{ question: "この作品で「音」を中心に置いた理由を教えてください。", originalAnswer: null, translatedAnswer: "街には、目で見えるものより先に、耳に残るものがあります。雨の音や信号の音を通して、主人公が言葉にできない記憶へ近づく時間を描きたいと思いました。", editedAnswer: null }, { question: "映画を撮ることは、あなたにとってどんな行為ですか。", originalAnswer: null, translatedAnswer: "遠くにいる場所や人との距離を測ることです。近づきすぎず、忘れすぎず、その間にある感覚を画面に残したいです。", editedAnswer: null }], publishedAt: "2026-08-03", status: "published" },
    { id: "interview-makoto-cafe", slug: "makoto-cafe", directorId: "director-takahashi-makoto", movieId: "movie-quiet-afternoon", title: "「会話の余白を、映画の時間にしたかった」", intro: "『静かな午後』の高橋真琴監督に、小さな喫茶店での撮影について聞きました。", questionsAndAnswers: [{ question: "一軒の喫茶店を舞台に選んだ理由は。", originalAnswer: null, translatedAnswer: "場所が持つ時間を、そのまま映画のリズムにしたかったからです。", editedAnswer: null }, { question: "観客にどんな時間を持ち帰ってほしいですか。", originalAnswer: null, translatedAnswer: "誰かとの会話を少しだけ思い出すような、静かな余白です。", editedAnswer: null }], publishedAt: "2026-07-19", status: "published" }
  ],
  articles: [
    { id: "article-short-film-space", slug: "short-film-space", type: "ESSAY", title: "15分間の宇宙。短編映画がくれる、自由な時間。", excerpt: "短い時間だからこそ立ち上がる、映画の密度と余白について。", publishedAt: "2026-07-28", status: "published" },
    { id: "article-making-quiet-afternoon", slug: "making-quiet-afternoon", type: "MAKING", title: "一軒の喫茶店から始める、静かな午後のつくり方。", excerpt: "ロケーションの空気を作品のリズムへ変えるまでの制作メモ。", publishedAt: "2026-07-19", status: "published" },
    { id: "article-city-sounds", slug: "city-sounds", type: "FEATURE", title: "街の音から映画を見つける。CINEVERSE TOWNの歩き方。", excerpt: "看板と路地をきっかけに、偶然の一本へ近づくための案内。", publishedAt: "2026-07-04", status: "published" }
  ]
};

/* Backward-compatible aliases during the static prototype phase. */
window.CINEVERSE_FILMS = window.CINEVERSE_DATA.movies;
window.CINEVERSE_ARTICLES = window.CINEVERSE_DATA.articles;
