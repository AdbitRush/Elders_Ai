#!/usr/bin/env python3
"""Build the ten consolidated-package articles (2026-11-03) into flat root pages, and rewrite articles.html (13 cards).

    python tools/build_articles2.py <dir with the package's articles/ folder>

- Body text is converted from the package markdown and checked word-for-word (fidelity) against the source.
- Only two lines are changed on purpose: the status line ("English editorial draft." / "Original article developed from Muse ...") becomes
  "Evidence checked 3 November 2026. English only." (internal provenance does not belong on a public page), and the blockquote disclaimer
  is shown as the page's note box (its text is asserted to equal the site disclaimer).
- A "Related game" box is written ONLY when the game's route really exists (js/games/<id>.js present); otherwise plain text, never a guessed link.
- The three existing live articles are not regenerated; they are only listed in the index (same titles and summaries as before).
"""
import html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.abspath(sys.argv[1]), 'articles')
DISCLAIMER = "BrainPlay is for entertainment and practice. It has not been shown to prevent or treat dementia and is not a medical assessment."
EVIDENCE = "Evidence checked 3 November 2026. English only."

# slug, summary, hero image (existing web copy; Muse original, see images/art/muse-provenance-*.json), games
A = [
 ("01-the-pleasure-of-being-a-beginner.md", "article-the-pleasure-of-being-a-beginner.html",
  "Why learning something unfamiliar can be satisfying, what the large Synapse study did and did not show, and how to make a new rule approachable.", "images/art/scene-garden.webp", ["patternworkshop"]),
 ("02-why-coming-back-can-help-learning.md", "article-why-coming-back-can-help-learning.html",
  "Spacing practice over time, what controlled studies of spaced retrieval found, and why a revisit should be a choice and not a chore.", "images/art/scene-quiz.webp", ["namegarden"]),
 ("03-try-to-remember-then-check.md", "article-try-to-remember-then-check.html",
  "Trying to remember first, then seeing the answer, and why feedback matters more than the try alone.", "images/art/scene-quiz.webp", ["namegarden"]),
 ("04-give-a-new-name-a-connection.md", "article-give-a-new-name-a-connection.html",
  "A face-and-name mnemonic study, what its abstract can and cannot support, and keeping any memory aid kind and simple.", "images/art/scene-quiz.webp", ["namegarden"]),
 ("05-a-quieter-screen-for-play.md", "article-a-quieter-screen-for-play.html",
  "Distraction research, why not all extra information is the same, and why a calmer screen is a design choice and not a treatment.", "images/art/scene-still.webp", ["quietshelf"]),
 ("06-a-plan-you-can-change.md", "article-a-plan-you-can-change.html",
  "A planning study with a null overall result, and how a puzzle can let you try a route, notice a problem and change it.", "images/art/scene-journey.webp", ["daytown"]),
 ("07-play-a-rhythm-not-a-health-promise.md", "article-play-a-rhythm-not-a-health-promise.html",
  "A review of musical instrument training with mixed results, and why a browser pattern game is play and not music therapy.", "images/art/scene-numbers.webp", ["sequence"]),
 ("08-a-small-map-to-explore.md", "article-a-small-map-to-explore.html",
  "Navigation-training research with its limits, and a small fictional map you can explore inside a puzzle.", "images/art/scene-journey.webp", ["daytown"]),
 ("09-what-a-crossword-trial-can-tell-us.md", "article-what-a-crossword-trial-can-tell-us.html",
  "One carefully studied crossword programme in people with mild cognitive impairment, and why that is a reason for accurate reporting and not a promise.", "images/art/scene-library.webp", ["crossword"]),
 ("10-let-the-player-choose.md", "article-let-the-player-choose.html",
  "A small game-design study about player control, and why choices in a game should be clear and reversible.", "images/art/hero-home.webp", ["patternworkshop", "sequence"]),
]
GAME_LABEL = {
 "namegarden": ("Name Garden", "learn four fictional names, try to recall them, and always see the answer"),
 "patternworkshop": ("Pattern Workshop", "copy a small mosaic at your own pace, with a rule example and Undo"),
 "quietshelf": ("The Quiet Shelf", "find the objects that match one clear rule on an uncluttered shelf"),
 "daytown": ("A Day in Town", "order a few errands in a fictional town, or follow a small map; edit your plan freely"),
 "sequence": ("Sequence (with Porch Rhythm)", "repeat a short pattern of four pads, with optional sound and a silent mode"),
 "crossword": ("Daily Mini Crossword", "fill a small grid at your own pace; reveal a letter whenever you like"),
}
OLD3 = [
 ("What can brain games really do?", "article-what-brain-games-can-and-cannot-do.html", "Targeted practice, what long-term trials found, and why a promising 2026 result is not proof that ordinary games prevent dementia."),
 ("Make a game an invitation", "article-make-a-game-an-invitation.html", "Playing with someone as an occasion to talk, and what the small-group research can and cannot tell us."),
 ("A game is one part of your day", "article-a-game-is-one-part-of-your-day.html", "Enjoyment, a comfortable pace and the wider picture of healthy routines, and why a game score is not a diagnosis."),
]
existing = open(os.path.join(ROOT, 'article-make-a-game-an-invitation.html'), encoding='utf-8').read()
HEAD = existing[:existing.index('<main class="wrap">') + len('<main class="wrap">')] + "\n"
TAIL = existing[existing.index('</main>'):]
BACK = re.search(r'  <p class="back">.*?</p>\n', existing, re.S).group(0)


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
    t = re.sub(r"(https?://[^\s<]+?)([.,;)]*)(?=\s|$)", lambda m: '<a href="%s" rel="noopener noreferrer">%s</a>%s' % (m.group(1), m.group(1), m.group(2)), t)
    t = re.sub(r"\[(\d+(?:-\d+)?)\]", lambda m: '<a class="cite" href="#%s">[%s]</a>' % (('src-' + m.group(1)) if '-' not in m.group(1) else 'sources', m.group(1)), t)
    return t


def convert(md):
    lines = md.splitlines(); out = []; title = None; note = None; i = 0; sources = []
    def flush_src(first):
        sources.append(first)
    while i < len(lines):
        ln = lines[i]
        if not ln.strip(): i += 1; continue
        if ln.startswith("# "): title = ln[2:].strip(); i += 1; continue
        if ln.startswith("Evidence checked"): i += 1; continue
        if ln.startswith(">"):
            note = ln[1:].strip(); i += 1; continue
        if ln.startswith("### ") or ln.startswith("## "):
            txt = ln.lstrip('#').strip()
            if txt in ("Sources", "Source"): i += 1; continue
            out.append("<h2>%s</h2>" % inline(txt)); i += 1; continue
        m = re.match(r"^Sources?:\s*(.*)$", ln)
        if m:
            if m.group(1): sources.append(m.group(1))
            i += 1; continue
        if re.match(r"^\[\d+\] ", ln):
            sources.append(ln.strip()); i += 1; continue
        if ln.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append("<li>%s</li>" % inline(lines[i][2:].strip())); i += 1
            out.append("<ul>\n" + "\n".join(items) + "\n</ul>"); continue
        para = [ln.strip()]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"(#|- |>|Sources?:|\[\d+\] |Evidence checked)", lines[i]):
            para.append(lines[i].strip()); i += 1
        text = " ".join(para)
        cls = ' class="bottom"' if re.match(r"\**The bottom line:", text) else ""
        out.append("<p%s>%s</p>" % (cls, inline(text)))
    return title, note, "\n".join(out), sources


def src_html(sources):
    li = []
    for s in sources:
        m = re.match(r"^\[(\d+)\]\s*(.*)$", s)
        li.append('<li id="src-%s" value="%s">%s</li>' % (m.group(1), m.group(1), inline(m.group(2))))
    return '<section id="sources" class="sources">\n<h2>Sources</h2>\n<ol>\n' + "\n".join(li) + "\n</ol>\n</section>"


def related(games):
    rows = []
    for g in games:
        name, what = GAME_LABEL[g]
        ready = os.path.exists(os.path.join(ROOT, 'js', 'games', g + '.js'))
        if ready:
            rows.append('<li><a href="./?lang=en#%s">Play %s</a> <span>%s.</span></li>' % (g, html.escape(name), html.escape(what)))
        else:
            rows.append('<li><strong>%s</strong> <span>%s. Not available yet.</span></li>' % (html.escape(name), html.escape(what)))
    return ('<aside class="related" aria-label="Related game">\n<h2>Related game</h2>\n<ul>\n' + "\n".join(rows) +
            '\n</ul>\n<p class="small">For entertainment and practice. Not a medical test or treatment. This game was not part of the research above.</p>\n</aside>')


def words(s):
    s = re.sub(r"<[^>]+>", " ", s); s = html.unescape(s)
    return [re.sub(r"[^\w]", "", w) for w in re.findall(r"\S+", s) if re.sub(r"[^\w]", "", w)]


cards = []
for md_name, out_name, summary, hero, games in A:
    md = open(os.path.join(SRC, md_name), encoding="utf-8").read()
    title, note, body, sources = convert(md)
    assert note == DISCLAIMER, (md_name, note)
    page = HEAD.replace("<title>Articles - BrainPlay</title>", "<title>%s - BrainPlay</title>" % html.escape(title, quote=False))
    page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % html.escape(summary, quote=True), page)
    page += '  <p class="crumb"><a href="articles.html">&larr; All articles</a></p>\n'
    page += '  <img class="hero" src="%s" alt="" width="1600" height="1067" loading="lazy" decoding="async">\n' % hero
    page += "  <h1>%s</h1>\n  <p class=\"meta\">%s</p>\n" % (html.escape(title, quote=False), EVIDENCE)
    page += '  <aside class="note" role="note"><strong>Please note:</strong> %s</aside>\n' % DISCLAIMER
    full = body + "\n" + related(games) + "\n" + src_html(sources)
    page += "\n".join("  " + l for l in full.splitlines()) + "\n" + BACK + TAIL
    open(os.path.join(ROOT, out_name), "w", encoding="utf-8", newline="\n").write(page)
    # fidelity: every source word (minus status line and the disclaimer blockquote, with the Source label words) in order in body+sources
    src_txt = re.sub(r"^Evidence checked.*$", "", md, flags=re.M); src_txt = re.sub(r"^>.*$", "", src_txt, flags=re.M)
    src_txt = re.sub(r"^#+ ", "", src_txt, flags=re.M)
    src_txt = re.sub(r"^\[\d+\] ", "", src_txt, flags=re.M); src_txt = re.sub(r"^(Sources?:)\s*\[\d+\] ", r"\1 ", src_txt, flags=re.M)   # numbered by the list itself
    sw = words(src_txt); pw = words("# " + title) + words(body + "\n" + src_html(sources))
    sw = [w for w in sw if w not in ("Source", "Sources")]; pw = [w for w in pw if w not in ("Source", "Sources")]
    ok = sw == pw
    print(out_name, "words", len(sw), len(pw), "FIDELITY OK" if ok else "FIDELITY MISMATCH")
    if not ok:
        for k, (x, y) in enumerate(zip(sw, pw)):
            if x != y: print("  first diff at", k, sw[max(0, k - 4):k + 4], pw[max(0, k - 4):k + 4]); break
    cards.append((title, out_name, summary))

idx = HEAD.replace("<title>Articles - BrainPlay</title>", "<title>Articles - BrainPlay</title>")
idx += "  <h1>Articles</h1>\n"
idx += '  <p class="lead">Short articles on what research does and does not say about games, learning, attention, planning, music and daily routines. Each one names its sources and states its limits, and some link to a game you can try.</p>\n'
idx += '  <aside class="note" role="note"><strong>Please note:</strong> %s</aside>\n' % DISCLAIMER
idx += '  <ul class="articles">\n'
for t, f, s in OLD3 + cards:
    idx += '    <li><a href="%s">%s</a><span>%s</span></li>\n' % (f, html.escape(t, quote=False), html.escape(s, quote=False))
idx += "  </ul>\n  <h2>How to read them</h2>\n"
idx += "  <p>These articles are about related research. None of the studies they cite tested BrainPlay. Sources were checked on 2 and 3 November 2026; some studies were read as abstracts only, and each article says so where it matters. The games linked from them are for entertainment and practice: they are not copies of the research programmes, not a medical test, and not a treatment.</p>\n"
idx += BACK.replace('<a href="articles.html">All articles</a> &middot; ', "") + TAIL
open(os.path.join(ROOT, "articles.html"), "w", encoding="utf-8", newline="\n").write(idx)
print("articles.html written:", len(OLD3) + len(cards), "cards")
