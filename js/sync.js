// sync.js: 同期コードを使ってお気に入りをデバイス間で同期する
// バックエンド: Cloudflare Worker + KV (favorites-sync)。
// 「同期コード」をキーにしてサーバー上の1件のレコードを共有し、
// updatedAtが新しい方を採用するLWW(last-write-wins)方式で同期する。

import { getFavorites, getFavoritesUpdatedAt, applyFavoritesFromSync, onFavoritesChanged } from "./data.js";

const APP_NAME = "us-jazz-history";
const SYNC_URL = "https://favorites-sync.kimuhixy.workers.dev/sync";
const CODE_KEY = "us-jazz-history:sync-code";
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/O, 1/I等の紛らわしい文字は除外

export function getSyncCode() {
  return localStorage.getItem(CODE_KEY) || "";
}

export function setSyncCode(code) {
  const normalized = code.trim().toUpperCase();
  localStorage.setItem(CODE_KEY, normalized);
  return normalized;
}

export function clearSyncCode() {
  localStorage.removeItem(CODE_KEY);
}

export function generateSyncCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const b of bytes) code += CODE_CHARS[b % CODE_CHARS.length];
  return setSyncCode(code);
}

let syncing = false;
let pendingRerun = false;

// サーバーとお気に入りを1往復させ、勝った側の内容をローカルに反映する
export async function pushFavorites() {
  const code = getSyncCode();
  if (!code) return null;

  if (syncing) {
    pendingRerun = true;
    return null;
  }
  syncing = true;
  try {
    const res = await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app: APP_NAME,
        code,
        favorites: getFavorites(),
        updatedAt: getFavoritesUpdatedAt(),
      }),
    });
    if (!res.ok) throw new Error(`同期に失敗しました (status ${res.status})`);
    const winner = await res.json();
    applyFavoritesFromSync(winner.favorites, winner.updatedAt);
    return winner;
  } finally {
    syncing = false;
    if (pendingRerun) {
      pendingRerun = false;
      pushFavorites().catch((err) => console.warn("お気に入り同期に失敗しました:", err));
    }
  }
}

// アプリ起動時に一度呼び出す。以後、端末上でのお気に入り変更があるたびに自動で同期する
export function initSync() {
  if (getSyncCode()) {
    pushFavorites().catch((err) => console.warn("お気に入り同期に失敗しました:", err));
  }
  onFavoritesChanged((_, { fromSync }) => {
    if (!fromSync) {
      pushFavorites().catch((err) => console.warn("お気に入り同期に失敗しました:", err));
    }
  });
}
