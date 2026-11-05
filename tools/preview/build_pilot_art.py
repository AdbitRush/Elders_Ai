"""Build the site's pilot pictures from the verified Muse package. python -I tools/preview/build_pilot_art.py <staging dir> <repo root>
Originals are never changed (they stay in _BACKUPS/brainplay-muse-pilot-20261105). Crops only: no recolouring, no isolation, cream backgrounds stay.
Writes images/pilot/*.webp and images/pilot/provenance.json."""
import glob, hashlib, json, os, sys
from PIL import Image
st, repo = sys.argv[1:]
out = os.path.join(repo, 'images', 'pilot'); os.makedirs(out, exist_ok=True)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
orig = lambda k: glob.glob(os.path.join(st, 'originals', '*' + k + '*.webp'))[0]
rows = []
def save(im, name, src, box, w, q=80):
    c = im.crop(box); c = c.resize((w, round(w * c.size[1] / c.size[0])), Image.LANCZOS); p = os.path.join(out, name); c.save(p, 'WEBP', quality=q, method=6)
    rows.append({'file': 'images/pilot/' + name, 'size': list(c.size), 'bytes': os.path.getsize(p), 'source': os.path.basename(src), 'source_sha256': sha(src), 'crop_box': list(box)})
# garden: atlas thirds, then inside the printed blue frame (5% each side)
f = orig('garden-st'); im = Image.open(f).convert('RGB')
for i, n in enumerate(['empty', 'growing', 'ripe']):
    x = 912 * i; m = 46; save(im, f'garden-{n}.webp', f, (x + m, m, x + 912 - m, 912 - m), 360)
# everyday objects: square from the centre of each atlas cell, inside the cell's own cream tile
f = orig('counting'); im = Image.open(f).convert('RGB')
for n, (cx, cy) in {'apple': (480, 320), 'cup': (1440, 320), 'key': (480, 960), 'leaf': (1440, 960)}.items():
    save(im, f'object-{n}.webp', f, (cx - 270, cy - 270, cx + 270, cy + 270), 160, 82)
# wagon: only the painted upper band; the blank lower part is dropped on purpose
f = orig('prairie-wagon'); im = Image.open(f).convert('RGB'); save(im, 'scene-wagon.webp', f, (0, 0, 2240, 665), 1120, 76)
f = orig('old-lighthouse'); im = Image.open(f).convert('RGB'); save(im, 'scene-lighthouse.webp', f, (0, 0, 1920, 1280), 720, 76)
f = orig('telegraph'); im = Image.open(f).convert('RGB'); save(im, 'telegraph-key.webp', f, (120, 200, 1800, 1200), 360, 80)
json.dump({'status': 'PILOT, review candidate only. NOT CC0 and NOT legally cleared; applicable use rights not independently verified.',
           'origin': 'Muse, built-in image generator, free allowance, 2026-11-05 (as reported by Muse). Package brainplay-pilot-qualified-handoff-20261105.zip, sha256 9ef8234665edb20829f6f989c14c4e26348db4519c5b7634fc31a62515b9b4d7, verified on receipt.',
           'telegraph_note': 'Illustration only. Not a technically certified diagram or working mechanism.',
           'garden_note': 'Tomato states empty, growing and ripe only. No wilted, harvested or other-crop art exists.',
           'files': rows}, open(os.path.join(out, 'provenance.json'), 'w', encoding='utf-8'), indent=1)
for r in rows: print(r['file'], r['size'], r['bytes'])
