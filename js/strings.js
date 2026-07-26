// strings.js: 日本語/英語のUI文言辞書。LOCALEに応じてSオブジェクトの値が決まる。
import { LOCALE } from "./i18n.js";

const en = LOCALE === "en";

export const S = {
  // ===== 共通 =====
  loading: en ? "Loading…" : "読み込み中…",
  notFound: en ? "Page not found" : "ページが見つかりません",
  loadError: (msg) => (en ? `An error occurred while loading: ${msg}` : `読み込みエラーが発生しました: ${msg}`),
  person: en ? "Solo" : "個人",
  group: en ? "Group" : "グループ",
  periodUnknown: en ? "Period unknown" : "活動時期不明",
  yearUnknown: en ? "Year unknown" : "年不明",
  yearUnknownShort: en ? "unknown" : "不明",
  present: en ? "present" : "現在",
  periodSeparator: en ? "–" : "〜",
  decadeLabel: (y) => (en ? `${y}s` : `${y}年代`),
  artistsCount: (n) => (en ? `${n} artists` : `${n}組`),

  // ===== timeline.js =====
  timelineTitle: en ? "Timeline" : "年表",
  timelineLead: en
    ? "Explore American jazz artists by the decade they began their career, from the early 1900s to today."
    : "1900年代初頭から現在まで、活動開始年ごとにアメリカのジャズ・アーティストを辿れます。",
  seeMoreArtists: (n) => (en ? `See more artists from this era (${n}) →` : `この年代のアーティストをもっと見る(${n}組)→`),

  // ===== artists.js =====
  artistsTitle: en ? "Artists" : "アーティスト一覧",
  artistsLead: (n) => (en ? `Search and filter all ${n} American jazz artists.` : `全${n}組のアメリカのジャズ・アーティストを検索・絞り込みできます。`),
  searchPlaceholder: en ? "Search by artist name or personnel…" : "アーティスト名・参加ミュージシャン名で検索…",
  sortName: en ? "Name" : "名前順",
  sortBegin: en ? "Debut year" : "活動開始年順",
  sortAlbums: en ? "Album count" : "アルバム数順",
  typeAll: en ? "All" : "すべて",
  decadeAll: en ? "All eras" : "すべての年代",
  genreAll: en ? "All genres" : "すべてのジャンル",
  hitsCount: (n) => (en ? `${n} results` : `${n}件ヒット`),
  personnelHeading: (n) => (en ? `As featured personnel (${n} albums)` : `参加ミュージシャンとして(${n}件のアルバム)`),
  personnelHint: en
    ? "These albums matched your search in the personnel credits, not the artist name."
    : "アーティスト名ではなく、アルバムの参加ミュージシャンのクレジットが検索語と一致しています。",
  noResults: en ? "No matching artists found." : "該当するアーティストが見つかりませんでした。",
  featuredBadge: en ? "Featured" : "参加",

  // ===== artist-detail.js =====
  artistNotFound: en ? "Artist not found." : "アーティストが見つかりませんでした。",
  backToList: en ? "Back to list" : "一覧に戻る",
  backToArtists: en ? "← Back to artist list" : "← アーティスト一覧に戻る",
  favRemove: en ? "★ Remove from favorites" : "★ お気に入り解除",
  favAdd: en ? "☆ Add to favorites" : "☆ お気に入りに追加",
  wikipediaLabel: en ? "Wikipedia" : "Wikipedia(日本語版)",
  spotifySearch: en ? "Search on Spotify" : "Spotifyで検索",
  appleMusicSearch: en ? "Search on Apple Music" : "Apple Musicで検索",
  discographyHeading: (n) => (en ? `Studio Discography (${n} albums)` : `スタジオ・ディスコグラフィ(${n}枚)`),
  noAlbums: en ? "No studio albums on record." : "登録されているスタジオアルバムがありません。",
  personnelPrefix: en ? "Personnel: " : "参加ミュージシャン: ",
  lineupPrefix: en ? "Estimated lineup (based on tenure at release): " : "推定メンバー(発売年の在籍期間より): ",
  tracklistSummary: (n) => (en ? `Tracklist (${n} tracks)` : `収録曲(${n}曲)`),

  // ===== songs.js =====
  songsTitle: en ? "Song Search" : "楽曲検索",
  songsLead: (n) => (en ? `Search track titles across all ${n.toLocaleString()} songs.` : `全${n.toLocaleString()}曲の収録曲タイトルから検索できます。`),
  songSearchPlaceholder: en ? "Search by song title…" : "曲名で検索…",
  songSearchEmpty: en ? "Enter a song title to see results." : "曲名を入力すると検索結果が表示されます。",
  songNoResults: en ? "No matching songs found." : "該当する曲が見つかりませんでした。",
  songHitsCount: (n) => (en ? `${n} results` : `${n}件ヒット`),
  songHitsCountLimited: (n, limit) => (en
    ? `${n} results (showing the first ${limit}; try narrowing your search)`
    : `${n}件ヒット(先頭${limit}件のみ表示。絞り込みを追加してください)`),

  // ===== favorites.js =====
  favoritesTitle: en ? "Favorites" : "お気に入り",
  favoritesLead: en
    ? 'Artists you add via "☆ Add to favorites" on their detail page will appear here.'
    : "アーティスト詳細ページの「☆ お気に入りに追加」で登録したアーティストがここに表示されます。",
  favoritesEmpty: en
    ? 'You haven\'t added any favorites yet. Add some from the <a href="#/artists">artist list</a>.'
    : `まだお気に入りが登録されていません。<a href="#/artists">アーティスト一覧</a>から追加してみましょう。`,
  syncFailed: en ? "Sync failed. Please check your connection and try again." : "同期に失敗しました。通信環境を確認してもう一度お試しください。",
  syncPanelTitle: en ? "Sync Across Devices" : "デバイス間の同期",
  syncPanelLeadHasCode: en
    ? "Enter this sync code on your other devices to share your favorites."
    : "この同期コードを他の自分の端末に入力すると、お気に入りが共有されます。",
  syncNow: en ? "Sync now" : "今すぐ同期",
  syncReset: en ? "Turn off sync" : "同期を解除",
  syncPanelLeadNoCode: en
    ? "Generate a sync code to share your favorites with your other devices."
    : "同期コードを発行すると、他の自分の端末とお気に入りを共有できます。",
  syncGenerate: en ? "Generate a sync code" : "同期コードを発行する",
  syncJoinLabel: en ? "Have a code from another device? Enter it here." : "他の端末で発行したコードをお持ちの場合はこちら",
  syncJoinPlaceholder: en ? "e.g. AB3XQK7M" : "例: AB3XQK7M",
  syncJoinSubmit: en ? "Sync with this code" : "このコードで同期",
  syncResetConfirm: en
    ? "Turn off sync on this device? Your favorites will remain on this device."
    : "この端末での同期を解除しますか?お気に入り自体は端末に残ります。",

  // ===== genres.js =====
  genresTitle: en ? "Genre Family Tree" : "ジャンル系統図",
  genresLead: en
    ? "How the major genres in American jazz branched from one another. Tap a node to see artists in that genre."
    : "アメリカのジャズシーンにおける主なジャンルの派生関係です。ノードをタップするとそのジャンルのアーティスト一覧に移動します。",
  genresSvgAriaLabel: en ? "Genre family tree diagram" : "ジャンル系統図",

  // ===== glossary.js =====
  glossaryTitle: en ? "Glossary" : "用語集",
  glossaryLead: en
    ? "Common terms used in the American jazz scene."
    : "アメリカのジャズシーンでよく使われる用語をまとめました。",

  // ===== guide.js =====
  guideTitle: en ? "Essential Albums" : "名盤ガイド",
  guideLead: en
    ? "Essential albums picked for each genre — a great place to start listening."
    : "ジャンルごとに選んだ代表的な名盤です。まずここから聴き始めてみてください。",
  findOnAmazon: en ? "Find on Amazon" : "CD/レコードを探す",

  // ===== relations.js =====
  relationsTitle: en ? "Member Connections" : "メンバー相関図",
  relationsLead: en
    ? "Connections between key artists and musicians. Drag nodes to move them; tap an artist in the data to open their detail page."
    : "主要アーティスト・ミュージシャン間のつながりです。ノードをドラッグで動かせます。データに含まれるアーティストはタップで詳細ページへ移動します。",

  // ===== stats.js =====
  statsTitle: en ? "Statistics" : "統計",
  statsLead: (n) => (en ? `Trends in American jazz, based on all ${n} artists in the dataset.` : `収集したデータ(全${n}組)から見る、アメリカジャズの傾向です。`),
  basicInfo: en ? "Overview" : "基本情報",
  albumsByDecadeHeading: en ? "Albums Released by Decade" : "年代別アルバムリリース数",
  artistsByGenreHeading: en ? "Artists by Genre" : "ジャンル別アーティスト数",

  // ===== donate.js =====
  kofiSupport: en ? "☕ Support on Ko-fi" : "☕ Ko-fiで応援する",
};
