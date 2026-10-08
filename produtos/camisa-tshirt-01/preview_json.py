import json, os, sys
from PIL import Image, ImageDraw
src, x0, y0, x1, y1, s, out = sys.argv[1], *map(float, sys.argv[2:7]), sys.argv[7]
d = json.load(open(src))
im = Image.new('RGB', (int((x1 - x0) * s), int((y1 - y0) * s)), (17, 17, 17))
for L in d['layers'][1:]:
    col = tuple(L['fill'] or L['stroke'])
    mask = Image.new('L', im.size, 0); dr = ImageDraw.Draw(mask)
    T = lambda x, y: ((x - x0) * s, (y - y0) * s)
    polys, cur = [], None
    for c in L['contours']:
        if c[0] == 'M': cur = [T(c[1], c[2])]; polys.append(cur)
        elif c[0] == 'L': cur.append(T(c[1], c[2]))
        elif c[0] == 'C':
            p0 = cur[-1]; p1 = T(c[1], c[2]); p2 = T(c[3], c[4]); p3 = T(c[5], c[6])
            for k in range(1, 9):
                t = k / 8; u = 1 - t
                cur.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0], u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    # regra par-ímpar: cada contorno inverte a máscara
    for p in polys:
        if len(p) > 2:
            m2 = Image.new('L', im.size, 0); ImageDraw.Draw(m2).polygon(p, fill=255)
            if L['fill']:
                mask = Image.fromarray(__import__('numpy').bitwise_xor(__import__('numpy').array(mask), __import__('numpy').array(m2)))
            else:
                ImageDraw.Draw(mask).line(p + [p[0]], fill=255, width=max(1, int(L['width'] * s)))
    dr = ImageDraw.Draw(mask)
    for x, y, r in L['ellipses']:
        a, b = T(x, y)
        if L['fill']: dr.ellipse((a - r*s, b - r*s, a + r*s, b + r*s), fill=255)
        else: dr.ellipse((a - r*s, b - r*s, a + r*s, b + r*s), outline=255, width=max(1, int(L['width']*s)))
    im.paste(Image.new('RGB', im.size, col), (0, 0), mask)
im.save(out)
