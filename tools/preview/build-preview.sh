#!/usr/bin/env bash
# BrainPlay (games) PREVIEW build — branch preview/warm-redesign. Same pattern as AllyFind's preview:
#   - its own directory /opt/brainplay-preview (never /opt/Elders_Ai, which serves games.178-105-148-72.sslip.io);
#   - a static copy of the branch (git archive), review tool injected into every page, noindex;
#   - the service-worker cache name gets the build's sha, so reviewers never get a stale cached build;
#   - served by brainplay-preview.service on 127.0.0.1:8798 behind Caddy (games-preview.178-105-148-72.sslip.io).
set -euo pipefail
P=/opt/brainplay-preview
BRANCH=${BRANCH:-preview/warm-redesign}
mkdir -p "$P/notes" "$P/tool"
[ -d "$P/repo.git" ] || git clone -q --bare git@github.com:AdbitRush/Elders_Ai.git "$P/repo.git"
git --git-dir="$P/repo.git" fetch -q origin "+refs/heads/$BRANCH:refs/heads/$BRANCH"
SHA=$(git --git-dir="$P/repo.git" rev-parse --short "$BRANCH")
NEW=$P/site.new
rm -rf "$NEW"; mkdir -p "$NEW/__review"
git --git-dir="$P/repo.git" archive "$BRANCH" | tar -x -C "$NEW"
# the review tool comes from the branch itself; tools/ and the old1/old2 snapshots are not served
cp "$NEW/tools/preview/review.js" "$NEW/tools/preview/review.css" "$NEW/__review/"
rm -rf "$NEW/tools" "$NEW/old1" "$NEW/old2"
python3 - "$NEW" "$SHA $(date -u '+%Y-%m-%d %H:%M UTC')" "$SHA" <<'PY'
import pathlib, re, sys
root, build, sha = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
head = ('<meta name="robots" content="noindex,nofollow"><meta name="afr-build" content="%s">'
        '<script>try{var r=document.documentElement,p=localStorage.getItem("afr-palette");if(p)r.setAttribute("data-palette",p);'
        'var v=JSON.parse(localStorage.getItem("afr-v")||"{}");for(var k in v)r.setAttribute("data-v-"+k,v[k])}catch(e){}</script>'
        '<link rel="stylesheet" href="/__review/review.css"><script src="/__review/review.js" defer></script>') % build
n = 0
for f in root.rglob('*.html'):
    s = f.read_text(encoding='utf-8')
    if '</head>' in s and 'afr-build' not in s:
        s = s.replace('</head>', head + '</head>', 1); n += 1
        f.write_text(s, encoding='utf-8')
sw = root / 'sw.js'
if sw.exists():
    s = sw.read_text(encoding='utf-8')
    s2 = re.sub(r"const CACHE = 'golden-games-v(\d+)';", lambda m: "const CACHE = 'golden-games-v%s-%s';" % (m.group(1), sha), s)
    assert s2 != s, 'sw.js CACHE line not found'
    sw.write_text(s2, encoding='utf-8')
print('review tool injected into %d pages; sw cache renamed for %s' % (n, sha))
PY
chmod -R a+rX "$NEW"
rm -rf "$P/site.old"; [ -d "$P/site" ] && mv "$P/site" "$P/site.old"; mv "$NEW" "$P/site"; rm -rf "$P/site.old"
echo "=== brainplay preview built from $BRANCH @ $SHA"
