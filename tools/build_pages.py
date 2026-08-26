#!/usr/bin/env python3
"""Generate one indexable page per game per language, plus sitemap.xml.

    python tools/build_pages.py

WHY THESE EXIST
---------------
The whole site is one URL. A language chosen by JavaScript at that one URL is
not a separate page as far as a search engine is concerned, so five of the six
translations were invisible — and 27 games were competing as a single result.

WHAT THEY ARE, AND WHAT THEY ARE NOT
------------------------------------
Each page is a real page about one game in one language: its name, what it
trains, the cognitive skills it exercises, and how to play, with a button
through to the game itself. It is the "what is this and why would I play it"
page, which is a thing a person genuinely searches for.

It is deliberately NOT a doorway page. There is no automatic redirect and no
cloaking: the text a crawler sees is the text a visitor sees. That distinction
is the difference between this ranking and this getting the site penalised.

Content is read out of index.html, js/lang-content.js and js/categories.js, so
these pages cannot drift from the app. Rerun after changing any game text.

SUBPATH
-------
GitHub Pages serves this repo from /Elders_Ai/, so every link here is written
relative to that base. Getting this wrong breaks every link on the deployed
site while working perfectly on a local server, which is the trap the brief
warns about.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "/Elders_Ai"                      # the GitHub Pages project subpath
SITE = "https://adbitrush.github.io" + BASE
LANGS = ["he", "en", "es", "fr", "de", "el"]
RTL = {"he"}
LANG_NAME = {"he": "עברית", "en": "English", "es": "Español",
             "fr": "Français", "de": "Deutsch", "el": "Ελληνικά"}
OG_LOCALE = {"he": "he_IL", "en": "en_US", "es": "es_ES",
             "fr": "fr_FR", "de": "de_DE", "el": "el_GR"}

e = lambda s: html.escape(str(s), quote=True)


# ── read the app's own data so these pages cannot drift from it ────────────
def _block_at(src: str, open_brace: int) -> str:
    """Text inside the {...} that starts at open_brace."""
    depth, i = 0, open_brace
    while i < len(src):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return src[open_brace + 1:i]
        i += 1
    return ""


def _pairs(block: str) -> list:
    """key:"value" pairs, but only from blocks that really are UI tables.

    lang-content.js reuses the same language names for a completely different
    payload (word pools for the word games). Without this filter those pools
    overwrite the real table and every game reverts to its English name.
    """
    got = re.findall(r'(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"', block)
    if not any(k.startswith(("game_", "inst_")) or k == "site_title" for k, _ in got):
        return []
    return [(k, v.replace('\\"', '"')) for k, v in got]


def read_i18n() -> dict:
    """The six language tables, assembled the way the app assembles them.

    Two different shapes, and missing the second one is why es/fr/de/el silently
    came out in English on the first run:

        he: { ... }                                       <- index.html, literal
        en: { ... }
        i18nData.es = Object.assign({}, i18nData.en, {...})  <- index.html, EXTENDS en

    That third form means Spanish is English plus overrides, so the base has to
    be copied in first or every untranslated key comes out blank rather than
    falling back the way the running site does. js/lang-content.js then adds a
    further layer for es/fr/de/el and wins, exactly as it does at runtime.
    """
    src_html = (ROOT / "index.html").read_text(encoding="utf-8")
    out = {l: {} for l in LANGS}

    # 1. the two literal tables
    for lang in ("he", "en"):
        m = re.search(r"[\n{,]\s*" + lang + r"\s*:\s*\{", src_html)
        if m:
            for k, v in _pairs(_block_at(src_html, m.end() - 1)):
                out[lang][k] = v

    # 2. the four that extend English
    for lang in ("es", "fr", "de", "el"):
        out[lang] = dict(out["en"])                      # the base they inherit
        m = re.search(r"i18nData\." + lang + r"\s*=\s*Object\.assign\([^,]*,[^,]*,\s*\{", src_html)
        if m:
            for k, v in _pairs(_block_at(src_html, m.end() - 1)):
                out[lang][k] = v

    # 3. lang-content.js, which overrides at runtime
    src_js = (ROOT / "js" / "lang-content.js").read_text(encoding="utf-8")
    for lang in LANGS:
        for m in re.finditer(r"[{,\s]" + lang + r"\s*:\s*\{", src_js):
            for k, v in _pairs(_block_at(src_js, m.end() - 1)):
                out[lang][k] = v
    return out


def read_game_ids() -> list[str]:
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    m = re.search(r"window\.GAME_IDS\s*=\s*\[([^\]]*)\]", src)
    return [x.strip().strip("'\"") for x in m.group(1).split(",") if x.strip()]


def read_why() -> dict:
    """The one-line "what this trains" text, per language, from categories.js."""
    src = (ROOT / "js" / "categories.js").read_text(encoding="utf-8")
    m = re.search(r"const WHY = \{(.*?)\n  \};", src, re.S)
    out = {}
    for lang in LANGS:
        b = re.search(r"\n    " + lang + r": \{(.*?)\n    \},", m.group(1), re.S)
        out[lang] = dict(re.findall(r"(\w+)\s*:\s*'((?:[^'\\]|\\.)*)'", b.group(1))) if b else {}
    return out


def read_skills() -> dict:
    src = (ROOT / "js" / "categories.js").read_text(encoding="utf-8")
    m = re.search(r"const MAP = \{(.*?)\n  \};", src, re.S)
    out = {}
    for gid, lst in re.findall(r"(\w+)\s*:\s*\[([^\]]*)\]", m.group(1)):
        out[gid] = [x.strip().strip("'\"") for x in lst.split(",") if x.strip()]
    return out


def skill_labels() -> dict:
    """Skill id -> {lang: label}. he/en sit in SKILL_COLORS, the rest in SKILL_L10N."""
    src = (ROOT / "js" / "categories.js").read_text(encoding="utf-8")
    out: dict = {}
    block = re.search(r"const SKILL_COLORS = \{(.*?)\n  \};", src, re.S).group(1)
    for sid, he, en in re.findall(
            r"(\w+)\s*:\s*\{[^}]*label_he:\s*'([^']*)'[^}]*label_en:\s*'([^']*)'", block):
        out[sid] = {"he": he, "en": en}
    l10n = re.search(r"const SKILL_L10N = \{(.*?)\n  \};", src, re.S)
    if l10n:
        for lang in ("es", "fr", "de", "el"):
            b = re.search(r"\n    " + lang + r": \{([^}]*)\}", l10n.group(1))
            if not b:
                continue
            for sid, lab in re.findall(r"(\w+)\s*:\s*'([^']*)'", b.group(1)):
                out.setdefault(sid, {})[lang] = lab
    return out


TITLE_OVERRIDE = {"oddoneout": "game_odd_title", "wordsearch": "game_words_title",
                  "unscramble": "game_unscrbl_title", "truefalse": "game_tf_title"}
DESC_OVERRIDE = {"oddoneout": "game_odd_desc", "wordsearch": "game_words_desc",
                 "unscramble": "game_unscrbl_desc", "truefalse": "game_tf_desc"}

UI = {
    "play":    {"he": "שחקו עכשיו", "en": "Play now", "es": "Jugar ahora",
                "fr": "Jouer maintenant", "de": "Jetzt spielen", "el": "Παίξτε τώρα"},
    "trains":  {"he": "מה זה מאמן", "en": "What it trains", "es": "Qué entrena",
                "fr": "Ce que cela entraîne", "de": "Was es trainiert", "el": "Τι γυμνάζει"},
    "skills":  {"he": "מיומנויות", "en": "Skills", "es": "Habilidades",
                "fr": "Compétences", "de": "Fähigkeiten", "el": "Δεξιότητες"},
    "howto":   {"he": "איך משחקים", "en": "How to play", "es": "Cómo se juega",
                "fr": "Comment jouer", "de": "So wird gespielt", "el": "Πώς παίζεται"},
    "all":     {"he": "כל המשחקים", "en": "All games", "es": "Todos los juegos",
                "fr": "Tous les jeux", "de": "Alle Spiele", "el": "Όλα τα παιχνίδια"},
    "free":    {"he": "חינם · בלי פרסומות · בלי מעקב",
                "en": "Free · no ads · no tracking",
                "es": "Gratis · sin anuncios · sin rastreo",
                "fr": "Gratuit · sans publicité · sans pistage",
                "de": "Kostenlos · keine Werbung · kein Tracking",
                "el": "Δωρεάν · χωρίς διαφημίσεις · χωρίς παρακολούθηση"},
    "other":   {"he": "בשפות אחרות", "en": "In other languages", "es": "En otros idiomas",
                "fr": "Dans d'autres langues", "de": "In anderen Sprachen",
                "el": "Σε άλλες γλώσσες"},
}


def page(gid, lang, i18n, why, skills, slabels) -> str:
    d = i18n[lang]
    title = d.get(TITLE_OVERRIDE.get(gid, f"game_{gid}_title")) \
        or i18n["en"].get(TITLE_OVERRIDE.get(gid, f"game_{gid}_title")) or gid
    desc = d.get(DESC_OVERRIDE.get(gid, f"game_{gid}_desc")) \
        or i18n["en"].get(DESC_OVERRIDE.get(gid, f"game_{gid}_desc")) or ""
    inst = d.get(f"inst_{gid}") or i18n["en"].get(f"inst_{gid}") or ""
    trains = why.get(lang, {}).get(gid) or why.get("en", {}).get(gid) or ""
    sk = [slabels.get(s, {}).get(lang) or slabels.get(s, {}).get("en") or s
          for s in skills.get(gid, [])]

    brand = d.get("site_title") or "Golden Games"
    rtl = lang in RTL
    canon = f"{SITE}/{lang}/{gid}/"
    play = f"{BASE}/?lang={lang}#{gid}"

    alts = "\n".join(
        f'<link rel="alternate" hreflang="{l}" href="{SITE}/{l}/{gid}/">' for l in LANGS)
    alts += f'\n<link rel="alternate" hreflang="x-default" href="{SITE}/en/{gid}/">'

    others = " · ".join(
        f'<a href="{BASE}/{l}/{gid}/">{e(LANG_NAME[l])}</a>' for l in LANGS if l != lang)

    ld = {
        "@context": "https://schema.org", "@type": "Game",
        "name": title, "description": desc, "url": canon,
        "inLanguage": lang, "genre": "Brain training",
        "isAccessibleForFree": True,
        "publisher": {"@type": "Organization", "name": brand},
    }

    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{'rtl' if rtl else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} — {e(brand)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
{alts}
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)} — {e(brand)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:locale" content="{OG_LOCALE[lang]}">
<meta property="og:image" content="{SITE}/images/cards/{gid}.jpg">
<link rel="icon" href="{BASE}/images/icon-192.png">
<link rel="manifest" href="{BASE}/manifest.json">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>
:root{{color-scheme:dark}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:system-ui,"Segoe UI","Noto Sans Hebrew",Arial,sans-serif;
  background:#0a1628;color:#e8eefc;font-size:20px;line-height:1.6;
  padding:28px 20px 60px}}
.wrap{{max-width:680px;margin:0 auto}}
a{{color:#ffd98a}}
h1{{font-size:clamp(28px,6vw,44px);line-height:1.2;color:#f6c048;margin-bottom:12px}}
h2{{font-size:22px;color:#f6c048;margin:28px 0 8px}}
p{{color:#cfdcf2}}
img{{width:100%;max-width:420px;border-radius:16px;margin:20px 0;display:block}}
.play{{display:inline-block;background:linear-gradient(135deg,#b7791f,#f6c048);
  color:#1a1200;font-weight:800;font-size:21px;padding:16px 34px;border-radius:14px;
  text-decoration:none;margin:22px 0;min-height:60px;line-height:1.4}}
.chips{{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}}
.chip{{background:rgba(246,192,72,.14);border:1px solid rgba(246,192,72,.4);
  color:#f6c048;border-radius:999px;padding:6px 14px;font-size:16px}}
.free{{display:inline-block;background:rgba(46,125,50,.18);border:1px solid rgba(110,231,140,.45);
  color:#b6f0c2;border-radius:999px;padding:6px 16px;font-size:16px;margin-bottom:18px}}
footer{{margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.14);
  font-size:16px;color:#c3cfe4}}
:focus-visible{{outline:4px solid #4da3ff;outline-offset:3px}}
</style>
</head>
<body>
<div class="wrap">
  <span class="free">{e(UI['free'][lang])}</span>
  <h1>{e(title)}</h1>
  <p>{e(desc)}</p>
  <a class="play" href="{play}">{e(UI['play'][lang])} →</a>
  <img src="{BASE}/images/cards/{gid}.jpg" alt="{e(title)}" width="400" height="300" loading="lazy">
  {f'<h2>{e(UI["trains"][lang])}</h2><p>{e(trains)}</p>' if trains else ''}
  {f'<h2>{e(UI["skills"][lang])}</h2><div class="chips">' + ''.join(f'<span class="chip">{e(x)}</span>' for x in sk) + '</div>' if sk else ''}
  {f'<h2>{e(UI["howto"][lang])}</h2><p>{e(inst)}</p>' if inst else ''}
  <footer>
    <p><a href="{BASE}/">{e(UI['all'][lang])}</a></p>
    <p style="margin-top:10px">{e(UI['other'][lang])}: {others}</p>
  </footer>
</div>
</body>
</html>
"""


def main() -> None:
    i18n, ids = read_i18n(), read_game_ids()
    why, skills, slabels = read_why(), read_skills(), skill_labels()

    written = 0
    for lang in LANGS:
        for gid in ids:
            out = ROOT / lang / gid
            out.mkdir(parents=True, exist_ok=True)
            (out / "index.html").write_text(
                page(gid, lang, i18n, why, skills, slabels), encoding="utf-8")
            written += 1

    urls = [f"{SITE}/"] + [f"{SITE}/{l}/{g}/" for l in LANGS for g in ids]
    body = "\n".join(
        f"  <url>\n    <loc>{u}</loc>\n"
        + ("".join(f'    <xhtml:link rel="alternate" hreflang="{l}" '
                   f'href="{SITE}/{l}/{u.rstrip("/").split("/")[-1]}/"/>\n' for l in LANGS)
           if u != f"{SITE}/" else "")
        + "  </url>"
        for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + body + "\n</urlset>\n", encoding="utf-8")

    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")

    print(f"{written} pages ({len(ids)} games x {len(LANGS)} languages)")
    print(f"sitemap.xml: {len(urls)} urls")


if __name__ == "__main__":
    main()
