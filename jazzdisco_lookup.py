import re
import html as htmlmod

ALT_TAKE_RE = re.compile(
    r'\((?P<tag>(?:new|short|long|shorter|longer|alt(?:ernate)?|false start|incomplete|rehearsal|edit(?:ed)?|extended)[^)]*)\)\s*$',
    re.IGNORECASE,
)
MASTER_RE = re.compile(r'\((?P<tag>(?:mst\.?|orig(?:inal)?\.?)[^)]*take[^)]*)\)\s*$', re.IGNORECASE)
ALIAS_RE = re.compile(r'\(\s*(?:mistitled\s+as|as|aka)\s+[^)]*\)\s*$', re.IGNORECASE)


def clean_title(raw):
    t = htmlmod.unescape(raw).strip()
    t = re.sub(r'\s+', ' ', t)
    return t


def strip_master_tag(title):
    return MASTER_RE.sub('', title).strip()


def strip_alias_tag(title):
    return ALIAS_RE.sub('', title).strip()


def load_catalog_blocks(path):
    with open(path, encoding='iso-8859-1') as f:
        html_text = f.read()
    # isolate the catalog-data div roughly (from first h2 to the closing of content)
    blocks = []
    for m in re.finditer(
        r'<h3><a href="album-index/index\.html#(?P<slug>[^"]+)" name="[^"]+">(?P<title>[^<]+)</a>.*?</h3>\n(?P<body>.*?)(?=<h[23]|</div>\s*<!-- id="content-data"|\Z)',
        html_text, re.S,
    ):
        slug = m.group('slug')
        title = clean_title(m.group('title'))
        body = m.group('body')
        blocks.append((slug, title, body))
    return blocks


def extract_tracks_from_block(body):
    rows = []
    for table_m in re.finditer(r'<table[^>]*>(.*?)</table>', body, re.S):
        table = table_m.group(1)
        for row_m in re.finditer(r'<tr><td(?: width="15%")?>[^<]*<td>([^<\n]+)', table):
            raw = row_m.group(1)
            rows.append(clean_title(raw))

    # group by base title
    order = []
    groups = {}  # base_title -> {"master": str or None, "solo": str or None, "count": int}
    for raw in rows:
        alt_m = ALT_TAKE_RE.search(raw)
        master_m = MASTER_RE.search(raw)
        alias_m = ALIAS_RE.search(raw)
        if master_m:
            base = strip_master_tag(raw)
            key = base.lower()
            g = groups.setdefault(key, {"base": base, "master": None, "any": [], "count": 0})
            g["master"] = base
            g["count"] += 1
            g["any"].append(raw)
            if key not in order:
                order.append(key)
        elif alias_m:
            base = strip_alias_tag(raw)
            key = base.lower()
            g = groups.setdefault(key, {"base": base, "master": None, "any": [], "count": 0})
            g["master"] = base
            g["count"] += 1
            g["any"].append(raw)
            if key not in order:
                order.append(key)
        elif alt_m:
            base = ALT_TAKE_RE.sub('', raw).strip()
            key = base.lower()
            g = groups.setdefault(key, {"base": base, "master": None, "any": [], "count": 0})
            g["count"] += 1
            g["any"].append(raw)
            if key not in order:
                order.append(key)
        else:
            # no take annotation at all (or an "OTHER" parenthetical kept whole)
            key = raw.lower()
            g = groups.setdefault(key, {"base": raw, "master": None, "any": [], "count": 0})
            g["master"] = g["master"] or raw
            g["count"] += 1
            g["any"].append(raw)
            if key not in order:
                order.append(key)

    tracks = []
    dropped = 0
    for key in order:
        g = groups[key]
        if g["master"]:
            tracks.append(g["master"])
        elif g["count"] == 1:
            tracks.append(g["base"])
        else:
            # 別テイクのみで、明確なマスターテイクの印が無い曲は
            # 誤った曲を採用するより除外を優先する(捏造しない)
            dropped += 1
    return tracks, dropped


def find_album(path, artist_name, album_title):
    blocks = load_catalog_blocks(path)
    norm_target = normalize(album_title)
    candidates = []
    for slug, title, body in blocks:
        t = title
        prefix = artist_name + " - "
        if t.startswith(prefix):
            t = t[len(prefix):]
        if normalize(t) == norm_target:
            candidates.append((slug, title, body))
    return candidates


def normalize(s):
    s = htmlmod.unescape(s)
    s = s.lower()
    s = s.replace("’", "'").replace("‘", "'")
    s = re.sub(r"[^a-z0-9']+", ' ', s)
    return s.strip()


if __name__ == "__main__":
    path = "/Users/user/Desktop/www.jazzdisco.org/miles-davis/catalog/index.html"
    for test_title in ["Kind of Blue", "'Round About Midnight", "Milestones", "First Miles"]:
        cands = find_album(path, "Miles Davis", test_title)
        print("===", test_title, "-> candidates:", len(cands))
        for slug, title, body in cands:
            tracks, dropped = extract_tracks_from_block(body)
            print(" ", title, "(", slug, ") ->", tracks, "dropped:", dropped)
