// favorites.js: お気に入り一覧(localStorage、同期コードでデバイス間同期も可能)

import { loadData, getFavorites } from "../data.js";
import { artistCardHtml } from "../components/artist-card.js";
import { getSyncCode, setSyncCode, clearSyncCode, generateSyncCode, pushFavorites } from "../sync.js";
import { escapeHtml } from "../router.js";
import { S } from "../strings.js";

export async function renderFavorites(view) {
  view.innerHTML = `<div class="loading">${S.loading}</div>`;

  let syncStatus = "";
  if (getSyncCode()) {
    try {
      await pushFavorites();
    } catch (err) {
      console.warn("お気に入り同期に失敗しました:", err);
      syncStatus = `<p class="sync-status sync-status--error">${S.syncFailed}</p>`;
    }
  }

  const { artists } = await loadData();
  const favIds = new Set(getFavorites());
  const favArtists = artists.filter((a) => favIds.has(a.mbid)).sort((a, b) => a.name.localeCompare(b.name));

  view.innerHTML = `
    <h1 class="page-title">${S.favoritesTitle}</h1>
    <p class="page-lead">${S.favoritesLead}</p>

    ${renderSyncPanel(syncStatus)}

    ${favArtists.length
      ? `<div class="artist-grid">${favArtists.map((a) => artistCardHtml(a)).join("")}</div>`
      : `<p class="empty-hint">${S.favoritesEmpty}</p>`}
  `;

  bindSyncPanel(view);
}

function renderSyncPanel(syncStatus) {
  const code = getSyncCode();
  return `
    <section class="card sync-panel">
      <h2 class="sync-panel__title">${S.syncPanelTitle}</h2>
      ${code
        ? `
          <p class="sync-panel__lead">${S.syncPanelLeadHasCode}</p>
          <p class="sync-code">${escapeHtml(code)}</p>
          ${syncStatus}
          <div class="sync-actions">
            <button type="button" class="btn" id="syncNowBtn">${S.syncNow}</button>
            <button type="button" class="btn" id="syncResetBtn">${S.syncReset}</button>
          </div>
        `
        : `
          <p class="sync-panel__lead">${S.syncPanelLeadNoCode}</p>
          <div class="sync-actions">
            <button type="button" class="btn primary" id="syncGenerateBtn">${S.syncGenerate}</button>
          </div>
          <form id="syncJoinForm" class="sync-join-form">
            <label for="syncCodeInput">${S.syncJoinLabel}</label>
            <div class="sync-join-row">
              <input type="text" id="syncCodeInput" maxlength="32" autocapitalize="characters" autocomplete="off" placeholder="${S.syncJoinPlaceholder}">
              <button type="submit" class="btn">${S.syncJoinSubmit}</button>
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
    if (!confirm(S.syncResetConfirm)) return;
    clearSyncCode();
    await renderFavorites(view);
  });
}
