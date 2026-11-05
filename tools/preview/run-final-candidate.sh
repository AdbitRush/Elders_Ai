#!/usr/bin/env bash
# One serial run against one committed revision, in both looks. Never starts a suite while another runs; already finished suites are not repeated.
#   bash tools/preview/run-final-candidate.sh <results dir> [suite names to run, default all]
# Servers: 8932 serves the worktree as it is (Classic for a new visitor), 8934 is forced-look-server.py (Refreshed for the same suites), 8931 is the base build for the Classic pixel check.
W=$(cd "$(dirname "$0")/../.." && pwd); PW=C:/Users/AdBitRush/Documents/whatsapp-deals-bot; C=http://127.0.0.1:8932; R=http://127.0.0.1:8934; B=http://127.0.0.1:8931
O="$1"; shift; ONLY=" $* "; mkdir -p "$O"; cd "$W" || exit 9; SHA=$(git rev-parse --short HEAD); [ -z "$(git status --porcelain)" ] || { echo "worktree not clean" >> "$O/summary.txt"; exit 8; }
free_mb() { powershell -NoProfile -c "[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)" | tr -d '\r'; }
run() { n=$1; shift; [ "$ONLY" = "  " ] || case "$ONLY" in *" $n "*) ;; *) return ;; esac
  [ -f "$O/$n.exit" ] && return
  for i in $(seq 1 120); do [ "$(free_mb)" -ge 800 ] && break; sleep 15; done
  s=$(date +%s); "$@" > "$O/$n.txt" 2>&1; x=$?; echo $x > "$O/$n.exit"; echo "$SHA $n exit $x $(( $(date +%s) - s ))s | $(tail -1 "$O/$n.txt" | cut -c1-110)" >> "$O/summary.txt"; }
run refresh node tools/preview/check-refresh.js "$PW" $C "$O/refresh" $B
run focus-C node tools/preview/check-focus.js $C "$O/focus-C-detail.txt"
run focus-R node tools/preview/check-focus.js $R "$O/focus-R-detail.txt"
run keys-R node tools/preview/check-nostalgia-keys.js "$PW" $R
run reg-R node tools/preview/check-regressions.js "$PW" $R
run layout-R node tools/preview/check-nostalgia-layout.js "$PW" $R "$O/layout-R"
run collection-R node tools/preview/check-collection.js "$PW" $R
run header-R env PW_DIR="$PW" node tools/preview/check-header.js $R "$O/header-R"
for s in 12.3 12.4 12.5 12.6 12.7; do
  run e2e-$s-R env E2E_SECTIONS=$s E2E_OUT="$O/e2e-$s-R.detail" node tools/preview/e2e-suite.js "$PW" $R
  run e2e-$s-C env E2E_SECTIONS=$s E2E_OUT="$O/e2e-$s-C.detail" node tools/preview/e2e-suite.js "$PW" $C
done
run keys-C node tools/preview/check-nostalgia-keys.js "$PW" $C
run reg-C node tools/preview/check-regressions.js "$PW" $C
run collection-C node tools/preview/check-collection.js "$PW" $C
for w in 1280 390; do
  run b1-$w-R node tools/preview/play-nostalgia.js "$PW" $R "" $w
  run b2-$w-R node tools/preview/play-nostalgia2.js "$PW" $R "" $w
  run b3-$w-R node tools/preview/play-nostalgia3.js "$PW" $R "" $w
  run b1-$w-C node tools/preview/play-nostalgia.js "$PW" $C "" $w
  run b2-$w-C node tools/preview/play-nostalgia2.js "$PW" $C "" $w
  run b3-$w-C node tools/preview/play-nostalgia3.js "$PW" $C "" $w
done
run all-1280-R node tools/preview/play-all.js "$PW" $R
echo "$SHA DONE" >> "$O/summary.txt"
