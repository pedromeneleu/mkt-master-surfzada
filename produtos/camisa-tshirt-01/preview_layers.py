import json, os, sys
from PIL import Image, ImageDraw
d = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'out', 'produtos', 'camisa-tshirt-01', 'back.json')))
x0, y0, x1, y1, s, out = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
im = Image.new('RGB', (int((x1 - x0) * s), int((y1 - y0) * s)), (17, 17, 17)); dr = ImageDraw.Draw(im)
T = lambda x, y: ((x - x0) * s, (y - y0) * s)
for L in d['layers'][1:]:
    col = tuple(L['fill'] or L['stroke'])
    polys, cur = [], None
    for c in L['contours']:
        if c[0] == 'M': cur = [T(c[1], c[2])]; polys.append(cur)
        elif c[0] == 'L': cur.append(T(c[1], c[2]))
        elif c[0] == 'C':
            p0 = cur[-1]; p1 = T(c[1], c[2]); p2 = T(c[3], c[4]); p3 = T(c[5], c[6])
            for k in range(1, 9):
                t = k / 8; u = 1 - t
                cur.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0], u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    for p in polys:
        if len(p) > 2:
            if L['fill']: dr.polygon(p, fill=col)
            else: dr.line(p + [p[0]], fill=col, width=max(1, int(L['width'] * s)))
    for x, y, r in L['ellipses']:
        a, b = T(x, y)
        if L['fill']: dr.ellipse((a - r*s, b - r*s, a + r*s, b + r*s), fill=col)
        else: dr.ellipse((a - r*s, b - r*s, a + r*s, b + r*s), outline=col, width=max(1, int(L['width']*s)))
im.save(out)
