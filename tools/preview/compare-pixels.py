"""Changed pixels between two screenshots: python -I compare-pixels.py a.png b.png -> prints the count and box. A channel difference above 8 counts as changed."""
import sys
from PIL import Image, ImageChops
a, b = [Image.open(x).convert('RGB') for x in sys.argv[1:3]]
if a.size != b.size: print(-1, 'size', a.size, b.size); sys.exit()
d = ImageChops.difference(a, b); m = Image.merge('L', [ImageChops.lighter(ImageChops.lighter(d.getchannel(0), d.getchannel(1)), d.getchannel(2))]) if False else ImageChops.lighter(ImageChops.lighter(d.getchannel(0), d.getchannel(1)), d.getchannel(2)).point(lambda v: 255 if v > 8 else 0)
print(sum(1 for v in m.getdata() if v), m.getbbox())
