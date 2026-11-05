#!/usr/bin/env bash
# The layout parts and the whole e2e suite for one committed revision, one at a time. bash tools/preview/run-final-stage.sh <results dir> <mode: both|refreshed>
W=$(cd "$(dirname "$0")/../.." && pwd); PW=C:/Users/AdBitRush/Documents/whatsapp-deals-bot; O="$1"; mkdir -p "$O"; cd "$W" || exit 9; SHA=$(git rev-parse --short HEAD); [ -z "$(git status --porcelain)" ] || { echo "not clean" >> "$O/summary2.txt"; exit 8; }
for look in R C; do U=http://127.0.0.1:8934; [ $look = C ] && U=http://127.0.0.1:8932; for i in 3 4 5 6 7 0 1 2; do t0=$(date +%s); f="$O/layout12-$i-$look.detail"; : > "$f"; timeout 900 env E2E_SECTIONS=12 E2E_SLICE=$i/8 E2E_OUT="$f" node tools/preview/e2e-suite.js "$PW" $U > "$O/layout12-$i-$look.txt" 2>&1; x=$?; echo "$SHA layout12.$i-$look exit $x $(( $(date +%s) - t0 ))s pass $(grep -c '^PASS ' "$f") fail $(grep -c '^FAIL ' "$f") end $(grep -c 'SECTION-END 12' "$f")" >> "$O/summary2.txt"; done; done
node tools/preview/e2e-batches.js "$PW" http://127.0.0.1:8934 "$O/e2e-R" 420 800 > "$O/e2e-R.txt" 2>&1; echo "$SHA e2e-R exit $? | $(tail -1 "$O/e2e-R.txt" | cut -c1-200)" >> "$O/summary2.txt"
echo "$SHA DONE2" >> "$O/summary2.txt"
