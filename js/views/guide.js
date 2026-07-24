// guide.js: 名盤ガイド

import { loadData, spotifySearchUrl, appleMusicSearchUrl } from "../data.js";
import { escapeHtml } from "../router.js";

let guideCache = null;
async function loadGuide() {
  if (!guideCache) guideCache = await fetch("data/album_guide.json").then((r) => r.json());
  return guideCache;
}

export async function renderGuide(view) {
  view.innerHTML = `<div class="loading">読み込み中…</div>`;
  const [{ genres }, guide] = await Promise.all([loadData(), loadGuide()]);
  const categoryById = new Map(genres.categories.map((c) => [c.id, c]));

  const html = genres.categories
    .filter((c) => guide[c.id]?.length)
    .map((c) => {
      const albums = guide[c.id];
      return `
        <section class="guide-genre">
          <h2>${escapeHtml(c.label)}</h2>
          <p class="genre-desc">${escapeHtml(c.description || "")}</p>
          ${albums.map((al) => {
            const q = `${al.artist} ${al.album}`;
            return `
              <div class="album-pick">
                <div class="title">${escapeHtml(al.album)} <span style="color:var(--text-dim); font-weight:400;">(${al.year})</span></div>
                <div class="artist">${escapeHtml(al.artist)}</div>
                <div class="note">${escapeHtml(al.note)}</div>
                ${al.personnel ? `<div class="personnel" style="margin-top:6px; font-size:0.85em; color:var(--text-dim);">参加ミュージシャン: ${escapeHtml(al.personnel)}</div>` : ""}
                <div class="album-links" style="margin-top:8px;">
                  <a href="${spotifySearchUrl(q)}">Spotify</a>
                  <a href="${appleMusicSearchUrl(q)}" target="_blank" rel="noopener">Apple Music</a>
                </div>
              </div>
            `;
          }).join("")}
        </section>
      `;
    }).join("");

  view.innerHTML = `
    <h1 class="page-title">名盤ガイド</h1>
    <p class="page-lead">ジャンルごとに選んだ代表的な名盤です。まずここから聴き始めてみてください。</p>
    ${html}
  `;
}
