// timeline.js: 年表ビュー(トップ画面)

import { loadData, decadeOf } from "../data.js";
import { artistCardHtml } from "../components/artist-card.js";

const DECADES = [
  {
    year: 1900,
    label: "1900年代〜1910年代",
    desc: `ニューオーリンズのブラスバンドやラグタイムを土台に、ジャズという音楽が産声を上げた黎明期。
      複数の管楽器が同時に即興を絡ませる集団即興(ポリフォニー)が基本形だった。`,
  },
  {
    year: 1920,
    label: "1920年代",
    desc: `ルイ・アームストロングが「ホット・ファイヴ/セヴン」で個人のソロ即興という発想を確立し、
      シカゴやニューヨークへとジャズの中心地が広がっていった。ジェリー・ロール・モートンら作編曲家も活躍した。`,
  },
  {
    year: 1930,
    label: "1930年代",
    desc: `大恐慌下のダンスホール文化とともに、大編成のビッグバンドによるスウィングが一世を風靡。
      デューク・エリントンやカウント・ベイシーが洗練されたアレンジで人気を博し、ジャズがポピュラー音楽の主流となった。`,
  },
  {
    year: 1940,
    label: "1940年代",
    desc: `チャーリー・パーカーとディジー・ガレスピーが、ハーレムのミントンズ・プレイハウスでの
      ジャムセッションから速く複雑な「ビバップ」を生み出し、ダンスミュージックから鑑賞音楽への転換点となった。
      同時期、アフロ・キューバンのリズムを取り込んだラテン・ジャズも誕生した。`,
  },
  {
    year: 1950,
    label: "1950年代",
    desc: `ビバップの熱量に対し、マイルス・デイヴィスらが抑制された音色のクールジャズを提示する一方、
      アート・ブレイキーやホレス・シルヴァーはブルースとゴスペルの泥臭さを取り戻したハードバップを確立。
      多様なスタイルが並走する黄金期を迎えた。`,
  },
  {
    year: 1960,
    label: "1960年代",
    desc: `マイルス・デイヴィス『カインド・オブ・ブルー』とジョン・コルトレーンの探求によりモードジャズが花開き、
      オーネット・コールマンやセシル・テイラーは調性や既存の形式から自由になるフリージャズを切り拓いた。
      ハードバップとモード奏法を折衷したポストバップも登場した。`,
  },
  {
    year: 1970,
    label: "1970年代",
    desc: `マイルス・デイヴィス『ビッチェズ・ブリュー』を契機に、ロックやファンクとジャズが融合する
      ジャズ・フュージョンが台頭。ウェザー・リポートやリターン・トゥ・フォーエヴァーらが
      エレクトリック楽器を駆使した新しいアンサンブルを追求した。`,
  },
  {
    year: 1980,
    label: "1980年代",
    desc: `フュージョンからさらにポップス寄りの聴きやすさを追求したスムースジャズがラジオで人気を博す一方、
      ウィントン・マルサリスら若い世代がアコースティックなジャズの伝統回帰を掲げ、
      ジャズ・メッセンジャーズは新人の登竜門であり続けた。`,
  },
  {
    year: 1990,
    label: "1990年代",
    desc: `クラブシーンから、ヒップホップやハウスのビートとジャズを組み合わせたアシッドジャズ/ヌー・ジャズが台頭。
      サンプリングを介してブルーノート時代の名演が新しいリスナー層に再発見された。`,
  },
  {
    year: 2000,
    label: "2000年代",
    desc: `ジャンルの垣根がさらに流動的になり、ヒップホップやネオソウルと交わる新世代ジャズが登場。
      エスペランサ・スポルディングら実力派の若手が台頭し、ジャズの語法を更新し続けた。`,
  },
  {
    year: 2010,
    label: "2010年代",
    desc: `ロバート・グラスパーやカマシ・ワシントンらが、R&B・ヒップホップ・スピリチュアル・ジャズの
      語法を横断する新たな潮流を牽引。ストリーミング時代を経て、ジャズは再び若い世代の耳に届くようになった。`,
  },
  {
    year: 2020,
    label: "2020年代〜",
    desc: `パンデミックを経て、ライブ配信やDIY精神を伴う新しい発表の形が模索される時代へ。
      過去の名盤の再評価とともに、ジャンル越境的な新世代のアーティストが各地で生まれ続けている。`,
  },
];

export async function renderTimeline(view) {
  view.innerHTML = `<div class="loading">読み込み中…</div>`;
  const { artists } = await loadData();

  const byDecade = new Map(DECADES.map((d) => [d.year, []]));
  for (const artist of artists) {
    const dec = decadeOf(artist.begin_year);
    if (dec != null && byDecade.has(dec)) {
      byDecade.get(dec).push(artist);
    } else if (dec != null && dec > 2020) {
      byDecade.get(2020).push(artist);
    } else if (dec != null && dec < 1900) {
      byDecade.get(1900).push(artist);
    }
  }

  const html = `
    <h1 class="page-title">年表</h1>
    <p class="page-lead">1900年代から現在まで、活動開始年ごとにアメリカのジャズ・アーティストを辿れます。</p>
    ${DECADES.map((d) => {
      const list = byDecade.get(d.year).sort((a, b) => (a.begin_year - b.begin_year) || a.name.localeCompare(b.name));
      return `
        <section class="decade-block">
          <div class="decade-header">
            <span class="decade-year">${d.label}</span>
            <span class="chip">${list.length}組</span>
          </div>
          <p class="decade-desc">${d.desc.trim().replace(/\s+/g, " ")}</p>
          <div class="artist-grid">
            ${list.slice(0, 24).map((a) => artistCardHtml(a)).join("")}
          </div>
          ${list.length > 24 ? `<p style="margin-top:10px"><a href="#/artists?decade=${d.year}">この年代のアーティストをもっと見る(${list.length}組)→</a></p>` : ""}
        </section>
      `;
    }).join("")}
  `;
  view.innerHTML = html;
}
