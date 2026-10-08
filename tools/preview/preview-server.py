#!/usr/bin/env python3
"""BrainPlay (games) redesign PREVIEW server — same as the AllyFind one, other sections.
Originally: AllyFind redesign PREVIEW server: static files + a tiny review-notes endpoint. Loopback only (Caddy proxies it).

Never part of the live site. Serves /opt/brainplay-preview/site; notes go to /opt/brainplay-preview/notes/notes.json.

  GET  /__review/notes   -> {"notes": {section: {...latest...}}, "updated": ...}
  POST /__review/notes   <- {"section": "...", "text": "...", "page": "...", "palette": "...", ...}
  Anything not in the preview (guides, posts) -> 302 to the same path on https://allyfind.com.

Usage: preview-server.py <port> <site_dir> <notes_file>
"""
import json
import mimetypes
import os
import sys
import tempfile
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

mimetypes.add_type("application/manifest+json", ".webmanifest")

PORT, ROOT, NOTES = int(sys.argv[1]), sys.argv[2], sys.argv[3]
SECTIONS = ("header", "hub", "cards", "allgames", "game", "win", "ads", "footer", "options", "general")
META = ("page", "palette", "theme", "lang", "viewport", "variants")
MAX_BODY, MAX_TEXT, MAX_HISTORY = 16_384, 5_000, 2_000
LOCK = threading.Lock()


def load():
    try:
        with open(NOTES, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, ValueError):
        return {"notes": {}, "history": []}


def save(data):
    d = os.path.dirname(NOTES)
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".notes-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.chmod(tmp, 0o644)
    os.replace(tmp, NOTES)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/__review/notes":
            with LOCK:
                d = load()
            return self._json(200, {"notes": d.get("notes", {}), "updated": d.get("updated")})
        fs = self.translate_path(path)
        if not os.path.exists(fs):
            return self.send_error(404)
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/__review/notes":
            return self._json(404, {"ok": False})
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_BODY:
            return self._json(413, {"ok": False, "error": "body size"})
        try:
            req = json.loads(self.rfile.read(n).decode("utf-8"))
        except ValueError:
            return self._json(400, {"ok": False, "error": "bad json"})
        sec, text = req.get("section"), req.get("text")
        if sec not in SECTIONS or not isinstance(text, str) or len(text) > MAX_TEXT:
            return self._json(400, {"ok": False, "error": "bad section or text"})
        entry = {"section": sec, "text": text, "saved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        for k in META:
            v = req.get(k)
            if isinstance(v, str):
                entry[k] = v[:200]
        with LOCK:
            d = load()
            d.setdefault("notes", {})[sec] = entry
            hist = d.setdefault("history", [])
            hist.append(entry)
            del hist[:-MAX_HISTORY]
            d["updated"] = entry["saved_at"]
            save(d)
        return self._json(200, {"ok": True, "saved_at": entry["saved_at"]})


    # The e2e suite's own checks save notes that start with "TEST note"; this removes those and nothing else.
    def do_DELETE(self):
        if self.path.split("?", 1)[0] != "/__review/notes/test":
            return self._json(404, {"ok": False})
        with LOCK:
            d = load()
            t = lambda e: str(e.get("text", "")).startswith("TEST note")
            n0 = len(d.get("history", []))
            d["notes"] = {k: v for k, v in d.get("notes", {}).items() if not t(v)}
            d["history"] = [e for e in d.get("history", []) if not t(e)]
            save(d)
        return self._json(200, {"ok": True, "removed": n0 - len(d["history"])})


if __name__ == "__main__":
    print(f"allyfind preview on 127.0.0.1:{PORT} root={ROOT} notes={NOTES}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
