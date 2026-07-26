// timeline.js: 年表ビュー(トップ画面)

import { loadData, decadeOf } from "../data.js";
import { artistCardHtml } from "../components/artist-card.js";
import { LOCALE } from "../i18n.js";
import { S } from "../strings.js";

const DECADES_JA = [
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

const DECADES_EN = [
  {
    year: 1900,
    label: "1900s–1910s",
    desc: `Jazz was born from New Orleans brass bands and ragtime, in an era defined by collective
      improvisation — multiple horns weaving improvised lines together (polyphony) rather than a single soloist.`,
  },
  {
    year: 1920,
    label: "1920s",
    desc: `Louis Armstrong's Hot Five and Hot Seven sides established the idea of the individual
      improvised solo, and jazz's center of gravity spread from New Orleans to Chicago and New York.
      Composer-arrangers like Jelly Roll Morton also came to prominence.`,
  },
  {
    year: 1930,
    label: "1930s",
    desc: `Alongside Depression-era dance hall culture, big-band swing swept the nation. Duke Ellington
      and Count Basie won mass popularity with sophisticated arrangements, and jazz became mainstream
      popular music.`,
  },
  {
    year: 1940,
    label: "1940s",
    desc: `Charlie Parker and Dizzy Gillespie, jamming at Minton's Playhouse in Harlem, forged the fast,
      harmonically complex language of bebop — turning jazz from dance music into music for listening.
      Latin jazz, blending Afro-Cuban rhythms into the tradition, also emerged in this period.`,
  },
  {
    year: 1950,
    label: "1950s",
    desc: `Against bebop's intensity, Miles Davis and others introduced the restrained tone of cool
      jazz, while Art Blakey and Horace Silver built hard bop, which brought back the earthiness of
      blues and gospel. A golden age of parallel styles took hold.`,
  },
  {
    year: 1960,
    label: "1960s",
    desc: `Miles Davis's "Kind of Blue" and John Coltrane's ongoing exploration opened up modal jazz,
      while Ornette Coleman and Cecil Taylor broke free of tonality and fixed form altogether with free
      jazz. Post-bop, blending hard bop with modal playing, also took shape.`,
  },
  {
    year: 1970,
    label: "1970s",
    desc: `Sparked by Miles Davis's "Bitches Brew," jazz fusion — blending jazz with rock and funk —
      rose to prominence. Weather Report and Return to Forever pursued new ensemble sounds built
      around electric instruments.`,
  },
  {
    year: 1980,
    label: "1980s",
    desc: `Smooth jazz, pushing fusion toward radio-friendly accessibility, found a wide audience,
      while a younger generation led by Wynton Marsalis championed a return to the acoustic jazz
      tradition. The Jazz Messengers remained a proving ground for new talent.`,
  },
  {
    year: 1990,
    label: "1990s",
    desc: `Out of the club scene, acid jazz and nu jazz emerged, pairing hip-hop and house beats with
      jazz. Sampling introduced classic Blue Note-era performances to a new generation of listeners.`,
  },
  {
    year: 2000,
    label: "2000s",
    desc: `Genre boundaries grew more fluid still, as a new generation of jazz crossed over with
      hip-hop and neo-soul. Formidable young players like Esperanza Spalding rose to prominence,
      continuing to update jazz's vocabulary.`,
  },
  {
    year: 2010,
    label: "2010s",
    desc: `Robert Glasper and Kamasi Washington led a new current crossing R&B, hip-hop, and
      spiritual jazz. In the streaming era, jazz found its way back to a younger generation's ears.`,
  },
  {
    year: 2020,
    label: "2020s—",
    desc: `Through the pandemic, artists explored new ways of performing and releasing music, from
      livestreaming to a DIY ethic. Alongside renewed appreciation for classic albums, a new
      generation of genre-crossing artists keeps emerging.`,
  },
];

const DECADES = LOCALE === "en" ? DECADES_EN : DECADES_JA;

export async function renderTimeline(view) {
  view.innerHTML = `<div class="loading">${S.loading}</div>`;
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
    <h1 class="page-title">${S.timelineTitle}</h1>
    <p class="page-lead">${S.timelineLead}</p>
    ${DECADES.map((d) => {
      const list = byDecade.get(d.year).sort((a, b) => (a.begin_year - b.begin_year) || a.name.localeCompare(b.name));
      return `
        <section class="decade-block">
          <div class="decade-header">
            <span class="decade-year">${d.label}</span>
            <span class="chip">${S.artistsCount(list.length)}</span>
          </div>
          <p class="decade-desc">${d.desc.trim().replace(/\s+/g, " ")}</p>
          <div class="artist-grid">
            ${list.slice(0, 24).map((a) => artistCardHtml(a)).join("")}
          </div>
          ${list.length > 24 ? `<p style="margin-top:10px"><a href="#/artists?decade=${d.year}">${S.seeMoreArtists(list.length)}</a></p>` : ""}
        </section>
      `;
    }).join("")}
  `;
  view.innerHTML = html;
}
