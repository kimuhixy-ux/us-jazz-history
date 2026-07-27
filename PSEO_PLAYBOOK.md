# US Jazz History 名盤ガイドPSEO運用手順

この文書は、精選名盤ガイドの日英静的ページを再生成・検証するための手順書です。生成ページは既存アプリを変更・置換せず、検索結果から事実情報とアプリ本体へ案内する入口として機能します。

## 対象データとURL

- 日本語入力: `data/album_guide.json`
- 英語入力: `data/album_guide.en.json`
- ジャンル名: `data/genres.json` / `data/genres.en.json`
- 日本語URL: `/items/<artist-album-year>/`
- 英語URL: `/en/items/<artist-album-year>/`

日英各240件をカテゴリ内の順序で対応させ、アーティスト、アルバム名、年が一致しなければ生成を停止する。slugはASCIIケバブケースで生成し、重複時は連番を付ける。

`data/artists.json` に含まれる約1.2万件の取得アルバムは、コンピレーション等を含む補助データであり、値の精査が済むまでPSEO対象にしない。

## 出力範囲

静的ページへ出力するのは次の事実情報に限定する。

- アルバム名
- アーティスト名
- 発表年
- ジャンル
- 参加ミュージシャン

次の内容は本文、title、description、OGP、JSON-LD、索引へ出力しない。

- `note` の紹介・評価文
- ジャケット画像
- 収録曲名・曲順・再生時間
- 音源

SpotifyとApple Musicは検索リンクだけを設置する。音声や歌詞、楽譜、コード進行をページ内へ複製しない。

## schema.org

- アルバム: `MusicAlbum`
- アーティスト: `Person` または `MusicGroup`
- 共通: `WebSite`、`WebPage`、`BreadcrumbList`
- 索引: `CollectionPage`

`data/artists.json` と名義が完全一致する場合だけ既存の種別を採用し、一致しない名義は `MusicGroup` とする。発売種別、レーベル、録音日など、データにない値を推測しない。

## AdSense・多言語・OGP

生成テンプレートから既存の `js/ads.js` を読み込み、本番ホストだけで `ca-pub-3562055879455682` を有効にする条件を維持する。各ページにcanonicalと `ja` / `en` / `x-default` hreflangを相互設定する。OGPには共通の `icons/icon-512.png` を使用する。

## sitemapとService Worker

240件×2言語、索引2ページ、既存主要6ページの合計488 URLを `sitemap.xml` に収録する。`robots.txt` から絶対URLで案内する。

生成ページはService Workerの事前キャッシュに追加しない。HTMLナビゲーションはネットワーク優先とし、オンライン時は更新版を取得し、通信失敗時のみ閲覧済みキャッシュへフォールバックする。

## 再生成と検証

```sh
python3 scripts/generate_pages.py
python3 scripts/validate_generated_pages.py
git diff --check
```

生成された `items/` と `en/items/` は手編集しない。データ、テンプレート、生成スクリプトを修正して再生成する。

## 公開前チェック

- [ ] 日英それぞれ240詳細ページがある
- [ ] 日英のslugと元レコードが一致する
- [ ] titleとdescriptionが各言語内で一意
- [ ] canonicalと相互hreflangが正しい
- [ ] OGPとTwitter Cardがある
- [ ] JSON-LDが構文エラーなく事実情報だけを含む
- [ ] 紹介文、画像、曲目、音源が生成ページに含まれない
- [ ] 全内部リンクの参照先が存在する
- [ ] 各索引に240件が1回ずつ載る
- [ ] sitemapが488 URLで重複なし
- [ ] 生成ページが事前キャッシュ対象外
- [ ] モバイル幅とデスクトップ幅で代表ページを確認
- [ ] git push前にオーナーの承認を得る
