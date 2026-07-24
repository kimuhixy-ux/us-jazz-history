// favorites.js: お気に入り一覧(localStorage、同期コードでデバイス間同期も可能)

import { loadData, getFavorites } from "../data.js";
import { artistCardHtml } from "../components/artist-card.js";
import { getSyncCode, setSyncCode, clearSyncCode, generateSyncCode, pushFavorites } from "../sync.js";
import { escapeHtml } from "../router.js";

export async function renderFavorites(view) {
  view.innerHTML = `<div class="loading">読み込み中…</div>`;

  let syncStatus = "";
  if (getSyncCode()) {
    try {
      await pushFavorites();
    } catch (err) {
      console.warn("お気に入り同期に失敗しました:", err);
      syncStatus = `<p class="sync-status sync-status--error">同期に失敗しました。通信環境を確認してもう一度お試しください。</p>`;
    }
  }

  const { artists } = await loadData();
  const favIds = new Set(getFavorites());
  const favArtists = artists.filter((a) => favIds.has(a.mbid)).sort((a, b) => a.name.localeCompare(b.name));

  view.innerHTML = `
    <h1 class="page-title">お気に入り</h1>
    <p class="page-lead">アーティスト詳細ページの「☆ お気に入りに追加」で登録したアーティストがここに表示されます。</p>

    ${renderSyncPanel(syncStatus)}

    ${favArtists.length
      ? `<div class="artist-grid">${favArtists.map((a) => artistCardHtml(a)).join("")}</div>`
      : `<p class="empty-hint">まだお気に入りが登録されていません。<a href="#/artists">アーティスト一覧</a>から追加してみましょう。</p>`}
  `;

  bindSyncPanel(view);
}

function renderSyncPanel(syncStatus) {
  const code = getSyncCode();
  return `
    <section class="card sync-panel">
      <h2 class="sync-panel__title">デバイス間の同期</h2>
      ${code
        ? `
          <p class="sync-panel__lead">この同期コードを他の自分の端末に入力すると、お気に入りが共有されます。</p>
          <p class="sync-code">${escapeHtml(code)}</p>
          ${syncStatus}
          <div class="sync-actions">
            <button type="button" class="btn" id="syncNowBtn">今すぐ同期</button>
            <button type="button" class="btn" id="syncResetBtn">同期を解除</button>
          </div>
        `
        : `
          <p class="sync-panel__lead">同期コードを発行すると、他の自分の端末とお気に入りを共有できます。</p>
          <div class="sync-actions">
            <button type="button" class="btn primary" id="syncGenerateBtn">同期コードを発行する</button>
          </div>
          <form id="syncJoinForm" class="sync-join-form">
            <label for="syncCodeInput">他の端末で発行したコードをお持ちの場合はこちら</label>
            <div class="sync-join-row">
              <input type="text" id="syncCodeInput" maxlength="32" autocapitalize="characters" autocomplete="off" placeholder="例: AB3XQK7M">
              <button type="submit" class="btn">このコードで同期</button>
            </div>
          </form>
        `}
    </section>
  `;
}

function bindSyncPanel(view) {
  const generateBtn = view.querySelector("#syncGenerateBtn");
  const joinForm = view.querySelector("#syncJoinForm");
  const syncNowBtn = view.querySelector("#syncNowBtn");
  const resetBtn = view.querySelector("#syncResetBtn");

  generateBtn?.addEventListener("click", async () => {
    generateSyncCode();
    await renderFavorites(view);
  });

  joinForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = view.querySelector("#syncCodeInput");
    const code = input.value.trim();
    if (!code) return;
    setSyncCode(code);
    await renderFavorites(view);
  });

  syncNowBtn?.addEventListener("click", async () => {
    await renderFavorites(view);
  });

  resetBtn?.addEventListener("click", async () => {
    if (!confirm("この端末での同期を解除しますか?お気に入り自体は端末に残ります。")) return;
    clearSyncCode();
    await renderFavorites(view);
  });
}
