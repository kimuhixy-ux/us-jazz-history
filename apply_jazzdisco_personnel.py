#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
us-jazz-history: ローカルにミラーした www.jazzdisco.org (Jazz Discography Project) の
カタログページから参加ミュージシャン情報を抽出し、data/artists.json の該当アルバムに
"personnel" フィールドとして反映するスクリプト。

jazzdisco.orgは録音セッション単位でメンバーを記録しており、MusicBrainzのリレーション
データより遥かに正確・網羅的(特にビバップ〜ハードバップ〜クールジャズ期のリーダー作)。
ネットワークアクセスは行わず、ローカルのミラー(~/Documents/mirror/www.jazzdisco.org)
だけを参照する。

各アーティストの catalog/index.html は次の構造の繰り返し:
  <h3><a href="...">アルバムタイトル</a> &nbsp; <i>レーベル 型番 &nbsp; 年</i></h3>
  <p>参加ミュージシャン, 楽器; ...</p>   (1エントリに複数セッションがある場合は複数<p>)
  <p class="date">録音日・場所</p>
  <table>...収録曲...</table>

同じアルバムタイトルで複数セッションがある場合は、それぞれの<p>をまとめて反映する。

このスクリプトはjazzdisco.orgでカバーされているアーティストのみを対象とし、該当しない
アーティストや、タイトルが一致しないアルバムには何もしない(既存のpersonnel値はそのまま)。

使い方:
  python3 apply_jazzdisco_personnel.py --mode test
  python3 apply_jazzdisco_personnel.py --mode full
"""

import argparse
import html
import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTISTS_PATH = os.path.join(BASE_DIR, "data", "artists.json")
PROGRESS_PATH = os.path.join(BASE_DIR, "data", "personnel_progress.json")
MIRROR_DIR = os.path.expanduser("~/Documents/mirror/www.jazzdisco.org")

H3_RE = re.compile(r"<h3>\s*<a[^>]*>(.*?)</a>.*?</h3>", re.DOTALL)
P_RE = re.compile(r"<p(?:\s+class=\"([^\"]*)\")?>(.*?)</p>", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
FOOTNOTE_RE = re.compile(r"\s*#[\d,\-\s]+")
STRAY_SPACE_RE = re.compile(r"\s+([,;.])")
DUP_PUNCT_RE = re.compile(r"([,;])\s*[,;]+")


def log(msg):
    print(msg, flush=True)


def slugify(name):
    s = name.lower()
    s = re.sub(r"[’']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def normalize_title(title):
    t = html.unescape(title)
    t = TAG_RE.sub("", t)
    t = t.lower()
    t = re.sub(r"[’']", "", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t.strip()


def clean_personnel_text(p_html):
    text = html.unescape(p_html)
    text = TAG_RE.sub("", text)
    text = FOOTNOTE_RE.sub("", text)
    text = STRAY_SPACE_RE.sub(r"\1", text)
    text = DUP_PUNCT_RE.sub(r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.rstrip(",;.")
    return text


def strip_artist_prefix(title, artist_name_norm):
    """jazzdisco.orgのタイトルは "Miles Davis - Kind Of Blue" のように
    アーティスト名(や "The X Quintet" 等のバリエーション)+ " - " + 本来のタイトル
    という形式のことが多い。" - "で区切った前半にアーティスト名が含まれていれば
    後半を「本来のタイトル」として追加で返す。"""
    if " - " not in title:
        return None
    prefix, rest = title.split(" - ", 1)
    prefix_norm = normalize_title(prefix)
    if artist_name_norm and artist_name_norm in prefix_norm:
        return rest.strip()
    return None


def parse_catalog(slug, artist_name=""):
    """1アーティストのcatalog/index.htmlを解析し、
    {normalized_title: personnel_string} の辞書を返す。"""
    artist_name_norm = normalize_title(artist_name)
    path = os.path.join(MIRROR_DIR, slug, "catalog", "index.html")
    if not os.path.exists(path):
        return {}

    with open(path, encoding="ISO-8859-1") as f:
        content = f.read()

    # id="catalog-data" 以降だけを対象にする(ヘッダ・サイドバー等を除外)
    start = content.find('id="catalog-data"')
    end = content.find('<!-- id="catalog-data" -->')
    if start == -1:
        return {}
    body = content[start:end if end != -1 else None]

    # h3ブロックごとに分割
    entries = {}
    matches = list(re.finditer(r"<h3>", body))
    for i, m in enumerate(matches):
        block_start = m.start()
        block_end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        block = body[block_start:block_end]

        h3_match = re.match(r"<h3>\s*<a[^>]*>(.*?)</a>", block, re.DOTALL)
        if not h3_match:
            continue
        title = html.unescape(TAG_RE.sub("", h3_match.group(1))).strip()
        norm_title = normalize_title(title)
        if not norm_title:
            continue

        # h3タグの後、最初の<table>より前にある<p>(class="date"以外)を人員情報として集める
        after_h3 = block[h3_match.end():]
        table_pos = after_h3.find("<table")
        head = after_h3[:table_pos] if table_pos != -1 else after_h3

        personnel_parts = []
        for p_match in P_RE.finditer(head):
            css_class, p_content = p_match.groups()
            if css_class == "date":
                continue
            cleaned = clean_personnel_text(p_content)
            if cleaned and cleaned not in personnel_parts:
                personnel_parts.append(cleaned)

        if not personnel_parts:
            continue

        combined = " / ".join(personnel_parts)
        # 同名タイトルが複数回登場する場合は最初の一致を優先する
        if norm_title not in entries:
            entries[norm_title] = combined

        stripped = strip_artist_prefix(title, artist_name_norm)
        if stripped:
            norm_stripped = normalize_title(stripped)
            if norm_stripped and norm_stripped not in entries:
                entries[norm_stripped] = combined

    return entries


def main():
    parser = argparse.ArgumentParser(description="jazzdisco.orgミラーから参加ミュージシャン情報を反映")
    parser.add_argument("--mode", choices=["test", "full"], default="test")
    args = parser.parse_args()

    with open(ARTISTS_PATH, encoding="utf-8") as f:
        artists = json.load(f)

    done_keys = set()
    if os.path.exists(PROGRESS_PATH):
        with open(PROGRESS_PATH, encoding="utf-8") as f:
            done_keys = set(json.load(f))

    available_slugs = {
        s for s in os.listdir(MIRROR_DIR)
        if os.path.isdir(os.path.join(MIRROR_DIR, s))
    }

    matched_artists = [a for a in artists if slugify(a["name"]) in available_slugs]
    if args.mode == "test":
        matched_artists = matched_artists[:3]

    log(f"=== jazzdisco.org一致アーティスト数: {len(matched_artists)} ===\n")

    total_albums = 0
    total_filled = 0

    for artist in matched_artists:
        slug = slugify(artist["name"])
        catalog = parse_catalog(slug, artist["name"])

        artist_filled = 0
        for i, album in enumerate(artist.get("albums", [])):
            total_albums += 1
            norm_title = normalize_title(album["title"])
            personnel = catalog.get(norm_title)
            if personnel:
                album["personnel"] = personnel
                total_filled += 1
                artist_filled += 1
                key = f"{artist['mbid']}::{i}::{album['title']}"
                done_keys.add(key)

        log(f"{artist['name']} ({slug}): カタログ{len(catalog)}件中 "
            f"{artist_filled}/{len(artist['albums'])}枚に反映")

    tmp_path = ARTISTS_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, ARTISTS_PATH)

    tmp_progress = PROGRESS_PATH + ".tmp"
    with open(tmp_progress, "w", encoding="utf-8") as f:
        json.dump(sorted(done_keys), f, ensure_ascii=False)
    os.replace(tmp_progress, PROGRESS_PATH)

    log(f"\n=== 完了: 対象{total_albums}枚中 {total_filled}枚にjazzdisco.orgの"
        f"参加ミュージシャン情報を反映しました ===")


if __name__ == "__main__":
    main()
