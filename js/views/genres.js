// genres.js: ジャンル系統図(SVGで静的に描画)

import { loadData } from "../data.js";
import { escapeHtml } from "../router.js";

// 各ジャンルカテゴリの表示位置(SVG座標、ノード中心)。おおよそ左→右が年代の流れ、
// 上下は系統(ヴォーカル/歌もの系・ビバップ本流・クール〜モード系・ラテン系)を表す。
const POSITIONS = {
  "traditional-jazz": { x: 110, y: 190 },
  "swing": { x: 290, y: 120 },
  "vocal-jazz": { x: 470, y: 60 },
  "bebop": { x: 470, y: 190 },
  "latin-jazz": { x: 650, y: 320 },
  "cool-jazz": { x: 650, y: 120 },
  "hard-bop": { x: 650, y: 190 },
  "soul-jazz": { x: 830, y: 120 },
  "modal-jazz": { x: 830, y: 250 },
  "free-jazz": { x: 1010, y: 190 },
  "post-bop": { x: 1010, y: 320 },
  "jazz-fusion": { x: 1190, y: 320 },
  "smooth-jazz": { x: 1370, y: 250 },
  "acid-jazz": { x: 1370, y: 400 },
  "other": { x: 110, y: 500 },
};

const NODE_W = 170;
const NODE_H = 48;

export async function renderGenres(view) {
  view.innerHTML = `<div class="loading">読み込み中…</div>`;
  const { genres } = await loadData();
  const { categories, genealogy } = genres;

  const edgesSvg = genealogy.map(({ from, to }) => {
    const a = POSITIONS[from];
    const b = POSITIONS[to];
    if (!a || !b) return "";
    return `<line class="edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`;
  }).join("");

  const nodesSvg = categories.map((c) => {
    const p = POSITIONS[c.id];
    if (!p) return "";
    return `
      <g class="genre-node" data-id="${c.id}" transform="translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})">
        <rect width="${NODE_W}" height="${NODE_H}"></rect>
        <text x="${NODE_W / 2}" y="${NODE_H / 2 - 4}" text-anchor="middle">${wrapLabel(c.label)[0]}</text>
        <text x="${NODE_W / 2}" y="${NODE_H / 2 + 12}" text-anchor="middle">${wrapLabel(c.label)[1] || ""}</text>
      </g>
    `;
  }).join("");

  view.innerHTML = `
    <h1 class="page-title">ジャンル系統図</h1>
    <p class="page-lead">アメリカのジャズシーンにおける主なジャンルの派生関係です。ノードをタップするとそのジャンルのアーティスト一覧に移動します。</p>
    <div class="genealogy-wrap">
      <svg viewBox="0 0 1500 580" width="1500" height="580" role="img" aria-label="ジャンル系統図">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10z" fill="#9a9aa8"></path>
          </marker>
        </defs>
        <g>${edgesSvg}</g>
        <g>${nodesSvg}</g>
      </svg>
    </div>
  `;

  view.querySelectorAll(".genre-node").forEach((node) => {
    node.addEventListener("click", () => {
      location.hash = `#/artists?genre=${node.dataset.id}`;
    });
  });
}

function wrapLabel(label) {
  const idx = label.indexOf(" / ");
  if (idx !== -1) return [label.slice(0, idx), label.slice(idx + 3)];
  if (label.length > 10) {
    const mid = Math.ceil(label.length / 2);
    const splitAt = label.lastIndexOf("(", mid) > 0 ? label.lastIndexOf("(", mid) : mid;
    return [label.slice(0, splitAt), label.slice(splitAt)];
  }
  return [label, ""];
}
