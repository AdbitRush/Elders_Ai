"""Frame the raw game screenshots (tools/preview/card-shots.js) as instant photos on warm paper -> images/cards/<id>.jpg.

    python tools/preview/frame_shots.py <raw dir> <out dir>

The picture is always the real game (Or, 2026-10-10: real screenshots, no stock photos of people); the nostalgia is in
the frame: a white instant-photo border with a deeper bottom edge, a slight tilt that differs per game, and a soft
shadow on a warm paper background. 960x720, progressive JPEG, the size the cards and landing pages already use.
"""
import hashlib, os, random, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 960, 720
PHOTO_W, PHOTO_H = 800, 520          # the picture inside the frame
BORDER, BOTTOM = 22, 70              # instant-photo border; the bottom edge is deeper


def trim(im):
    """Cut the screenshot down to the game itself: drop a thin band where the table's own border is, then the empty
    table around the game. (A wider fixed cut clipped games that use the full width, such as the letter keyboard.)"""
    im = im.convert('RGB')
    w, h = im.size
    inner = im.crop((14, 8, w - 14, h - 22))
    bg = Image.new('RGB', inner.size, inner.getpixel((inner.width // 2, 6)))
    diff = ImageChops.difference(inner, bg).convert('L').point(lambda v: 255 if v > 22 else 0)
    # ignore the table's rounded border, which can sit in the outermost few pixels
    ImageDraw.Draw(diff).rectangle([0, 0, 18, inner.height], fill=0)
    ImageDraw.Draw(diff).rectangle([inner.width - 18, 0, inner.width, inner.height], fill=0)
    box = diff.getbbox()
    if not box:
        return inner
    x0, y0, x1, y1 = box
    m = 26
    return inner.crop((max(0, x0 - m), max(0, y0 - m), min(inner.width, x1 + m), min(inner.height, y1 + m)))


def fit(im, color):
    """Contain the game in the photo area on its own table colour (never crop a game's buttons off)."""
    s = min(PHOTO_W / im.width, PHOTO_H / im.height)
    g = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    out = Image.new('RGB', (PHOTO_W, PHOTO_H), color)
    out.paste(g, ((PHOTO_W - g.width) // 2, (PHOTO_H - g.height) // 2))
    return out


def paper(seed):
    rnd = random.Random(seed)
    bg = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(bg)
    for y in range(H):                                 # warm cream to light caramel
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(248 - 14 * t), int(236 - 24 * t), int(212 - 34 * t)))
    noise = Image.effect_noise((W, H), 18).convert('L').point(lambda v: (v - 128) // 6 + 128)
    bg = ImageChops.overlay(bg, Image.merge('RGB', (noise, noise, noise)))
    return bg


def frame(raw, out):
    gid = os.path.splitext(os.path.basename(raw))[0]
    seed = int(hashlib.md5(gid.encode()).hexdigest(), 16)
    im = trim(Image.open(raw))
    table = im.getpixel((3, 3))
    photo = fit(im, table)
    pw, ph = PHOTO_W + 2 * BORDER, PHOTO_H + BORDER + BOTTOM
    card = Image.new('RGBA', (pw, ph), (255, 253, 247, 255))
    card.paste(photo, (BORDER, BORDER))
    ImageDraw.Draw(card).rectangle([BORDER - 1, BORDER - 1, BORDER + PHOTO_W, BORDER + PHOTO_H], outline=(225, 214, 196, 255))
    angle = (seed % 5 - 2) * 0.7                        # -1.4 .. +1.4 degrees, different per game
    card = card.rotate(angle, resample=Image.BICUBIC, expand=True)
    bg = paper(seed).convert('RGBA')
    shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    a = card.split()[3].point(lambda v: 110 if v else 0)
    sx, sy = (W - card.width) // 2 + 8, (H - card.height) // 2 + 14
    shadow.paste((60, 35, 10, 255), (sx, sy), a)
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    bg = Image.alpha_composite(bg, shadow)
    bg.alpha_composite(card, ((W - card.width) // 2, (H - card.height) // 2 - 4))
    bg.convert('RGB').save(out, 'JPEG', quality=84, progressive=True, optimize=True)


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if f.endswith('.png'):
            frame(os.path.join(src, f), os.path.join(dst, f[:-4] + '.jpg'))
            print(f[:-4], os.path.getsize(os.path.join(dst, f[:-4] + '.jpg')) // 1024, 'KB')
