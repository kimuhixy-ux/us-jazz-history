// songs.js: 楽曲(収録曲)検索

import { loadData, spotifySearchUrl, appleMusicSearchUrl } from "../data.js";
import { escapeHtml } from "../router.js";

const RESULT_LIMIT = 500;

export async function renderSongs(view, queryString) {
  view.innerHTML = `<div class="loading">読み込み中…</div>`;
  const { songs } = await loadData();
  const params = new URLSearchParams(queryString || "");

  const state = {
    q: params.get("q") || "",
  };

  view.innerHTML = `
    <h1 class="page-title">楽曲検索</h1>
    <p class="page-lead">全${songs.length.toLocaleString()}曲の収録曲タイトルから検索できます。</p>

    <div class="filter-bar">
      <input type="search" id="qInput" placeholder="曲名で検索…" value="${escapeHtml(state.q)}">
    </div>
    <div class="result-count" id="resultCount"></div>
    <div class="song-list" id="results"></div>
  `;

  const qInput = view.querySelector("#qInput");
  const resultsEl = view.querySelector("#results");
  const countEl = view.querySelector("#resultCount");

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    const qs = p.toString();
    history.replaceState(null, "", `#/songs${qs ? "?" + qs : ""}`);
  }

  function applyFilter() {
    const q = state.q.trim().toLowerCase();
    if (!q) {
      countEl.textContent = "";
      resultsEl.innerHTML = `<p class="empty-hint">曲名を入力すると検索結果が表示されます。</p>`;
      syncUrl();
      return;
    }

    const matches = songs.filter((s) => s.title.toLowerCase().includes(q));
    matches.sort((a, b) => a.title.localeCompare(b.title) || a.artistName.localeCompare(b.artistName));

    countEl.textContent = matches.length > RESULT_LIMIT
      ? `${matches.length}件ヒット(先頭${RESULT_LIMIT}件のみ表示。絞り込みを追加してください)`
      : `${matches.length}件ヒット`;

    const shown = matches.slice(0, RESULT_LIMIT);
    resultsEl.innerHTML = shown.length
      ? shown.map((s) => songRowHtml(s)).join("")
      : `<p class="empty-hint">該当する曲が見つかりませんでした。</p>`;
    syncUrl();
  }

  let debounceTimer;
  qInput.addEventListener("input", () => {
    state.q = qInput.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilter, 200);
  });

  applyFilter();
}

function songRowHtml(song) {
  const query = `${song.artistName} ${song.title}`;
  return `
    <div class="song-row">
      <div class="song-info">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <a class="song-artist" href="#/artist/${encodeURIComponent(song.artistSlug)}">${escapeHtml(song.artistName)}</a>
        <span class="song-album">${escapeHtml(song.albumTitle)}${song.year ? `(${song.year})` : ""}</span>
        ${song.length ? `<span class="track-length">${escapeHtml(song.length)}</span>` : ""}
      </div>
      <div class="song-links">
        <a href="${spotifySearchUrl(query)}">Spotify</a>
        <a href="${appleMusicSearchUrl(query)}" target="_blank" rel="noopener">Apple Music</a>
      </div>
    </div>
  `;
}
