"""
MusicBrainzで収録曲が見つからなかったアルバムについて、
jazzdisco.org(Desktop上にミラーされたカタログページ)から
収録曲リストを補完する。

jazzdisco.orgはビバップ~モード期(Blue Note/Prestige/Riverside系)を
中心にカバーしており、us-jazz-history全アーティストのうち一部のみが
対象。該当アーティストかつMusicBrainzで見つからなかったアルバムのみに
適用し、既存のtracksは上書きしない。

jazzdisco.orgのカタログページはテイク単位のセッション明細のため、
別テイク(alternate take等)を除きマスター(オリジナル)テイクのみを
1曲として抽出する。収録時間の情報は無いため length は None。
"""

import json
import os
import re
import unicodedata

import jazzdisco_lookup as jd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTISTS_PATH = os.path.join(BASE_DIR, "data", "artists.json")
JAZZDISCO_ROOT = "/Users/user/Desktop/www.jazzdisco.org"


def slugify(name):
    s = unicodedata.normalize("NFKD", name)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def load_jazzdisco_slugs():
    slugs = set()
    for entry in os.listdir(JAZZDISCO_ROOT):
        full = os.path.join(JAZZDISCO_ROOT, entry)
        if os.path.isdir(full):
            slugs.add(entry)
    return slugs


def main():
    with open(ARTISTS_PATH, encoding="utf-8") as f:
        artists = json.load(f)

    jd_slugs = load_jazzdisco_slugs()

    filled = 0
    checked = 0
    catalog_cache = {}

    for artist in artists:
        slug = slugify(artist["name"])
        if slug not in jd_slugs:
            continue
        path = os.path.join(JAZZDISCO_ROOT, slug, "catalog", "index.html")
        if not os.path.exists(path):
            continue

        for album in artist["albums"]:
            if album.get("tracks") is not None:
                continue
            checked += 1

            if path not in catalog_cache:
                catalog_cache[path] = jd.load_catalog_blocks(path)

            candidates = []
            norm_target = jd.normalize(album["title"])
            prefix = artist["name"] + " - "
            for b_slug, b_title, b_body in catalog_cache[path]:
                t = b_title
                if t.startswith(prefix):
                    t = t[len(prefix):]
                if jd.normalize(t) == norm_target:
                    candidates.append((b_slug, b_title, b_body))

            if not candidates:
                continue

            # 同名タイトルの候補ブロックが複数ある場合、どれか1つでも
            # 別テイクのみでマスターテイクを特定できない曲(dropped)を
            # 含んでいれば、そのタイトル自体の収録内容があいまいと判断し
            # 補完を見送る(捏造しない)。1曲や2曲だけの断片的な一致も
            # 誤って完全なトラックリストと誤認されるため除外する。
            extracted = [jd.extract_tracks_from_block(body) for _, _, body in candidates]
            if any(dropped > 0 for _, dropped in extracted):
                continue
            best_tracks = max((tracks for tracks, _ in extracted), key=len, default=[])
            if len(best_tracks) < 3:
                continue

            album["tracks"] = [
                {"position": i + 1, "title": title, "length": None}
                for i, title in enumerate(best_tracks)
            ]
            filled += 1
            print(f"[jazzdisco] {artist['name']} - {album['title']}: {len(best_tracks)}曲")

    print(f"=== 完了: {checked}件のMusicBrainz未検出アルバムを確認、{filled}件をjazzdisco.orgから補完 ===")

    tmp_path = ARTISTS_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, ARTISTS_PATH)


if __name__ == "__main__":
    main()
