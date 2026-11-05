"""Test server: serves a worktree with the Refreshed look switched on before any page script, so the existing suites run in that look unchanged.
python -I tools/preview/forced-look-server.py <port> <root>"""
import http.server, os, sys
PORT, ROOT = int(sys.argv[1]), sys.argv[2]
INJ = b"<head><script>try{localStorage.setItem('gg-look','refreshed')}catch(e){}</script>"
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass
    def do_GET(self):
        p = self.translate_path(self.path)
        if os.path.isdir(p): p = os.path.join(p, 'index.html')
        if p.endswith('.html') and os.path.isfile(p):
            b = open(p, 'rb').read().replace(b'<head>', INJ, 1)
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(b))); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(b); return
        return super().do_GET()
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
