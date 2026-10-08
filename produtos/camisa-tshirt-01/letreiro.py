"""Letreiro gótico próprio da Surfzada, desenhado do zero.

Cada letra é um esqueleto de traços. Os traços "pena" são varridos por uma pena
caligráfica larga e inclinada (o que dá o contraste grosso/fino da gótica), os
traços "fio" são linhas finas. No fim, um filete interno é recortado (inline),
no estilo "A.IRONS".

Coordenadas do glifo: base em y=0, altura de maiúscula 100, y pra cima.
"""
import math
from shapely.geometry import Polygon, LineString, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

NIB_W = 25.0          # largura da pena
NIB_ANG = 38.0        # inclinação da pena (graus)
HAIR = 3.2            # espessura dos fios
INLINE_IN = 2.6       # distância do filete interno à borda
INLINE_W = 1.5        # espessura do filete interno

# (tipo, pontos, suave)
G = {
    "D": [("pena", [(16, 94), (16, 6)], False),
          ("pena", [(8, 97), (40, 100), (66, 86), (71, 50), (65, 15), (38, 0), (5, 4)], True),
          ("pena", [(1, 82), (9, 97)], False),
          ("fio", [(37, 86), (37, 14)], False)],
    "O": [("pena", [(40, 100), (16, 86), (10, 50), (16, 14), (40, 0)], True),
          ("pena", [(40, 100), (64, 86), (70, 50), (64, 14), (40, 0)], True),
          ("fio", [(40, 86), (40, 14)], False)],
    "N": [("pena", [(6, 88), (16, 97), (16, 6), (6, 0)], False),
          ("pena", [(16, 86), (34, 100), (56, 92), (61, 70)], True),
          ("pena", [(61, 72), (61, 6), (72, 0)], False),
          ("fio", [(38, 84), (38, 18)], False)],
    "T": [("pena", [(3, 80), (16, 96), (40, 91), (62, 100), (80, 88)], True),
          ("pena", [(42, 93), (40, 52), (42, 14), (52, 2), (68, 8)], True)],
    "W": [("pena", [(4, 88), (13, 98), (13, 14), (25, 0), (40, 10)], False),
          ("pena", [(40, 97), (40, 10), (54, 0), (68, 10)], False),
          ("pena", [(68, 100), (68, 28)], False),
          ("fio", [(26, 88), (26, 16)], False),
          ("fio", [(54, 88), (54, 16)], False)],
    "A": [("pena", [(4, 4), (14, 0), (14, 62), (28, 92), (52, 100)], True),
          ("pena", [(52, 100), (67, 86), (67, 6), (78, 0)], True),
          ("pena", [(14, 48), (67, 54)], False),
          ("fio", [(40, 86), (40, 60)], False)],
    "S": [("pena", [(64, 88), (50, 100), (24, 94), (16, 74), (30, 56), (54, 46), (66, 26), (56, 6), (30, 0), (6, 10)], True)],
    "E": [("pena", [(62, 92), (46, 100), (20, 88), (12, 50), (20, 12), (44, 0), (68, 10)], True),
          ("pena", [(15, 52), (50, 57)], False),
          ("fio", [(38, 88), (38, 14)], False)],
    "Y": [("pena", [(4, 88), (15, 98), (15, 36), (30, 26), (61, 34)], True),
          ("pena", [(61, 99), (61, 2), (54, -24), (32, -34), (12, -24)], True),
          ("fio", [(38, 88), (38, 38)], False)],
    "U": [("pena", [(4, 88), (15, 98), (15, 14), (30, 0), (60, 10)], True),
          ("pena", [(60, 99), (60, 6), (71, 0)], False),
          ("fio", [(37, 88), (37, 14)], False)],
    "R": [("pena", [(6, 88), (16, 97), (16, 6), (5, 0)], False),
          ("pena", [(16, 90), (36, 100), (58, 90), (58, 66), (40, 54), (18, 52)], True),
          ("pena", [(36, 53), (54, 34), (58, 10), (72, 0)], True),
          ("fio", [(37, 90), (37, 62)], False)],
    "I": [("pena", [(8, 88), (22, 100)], False),
          ("pena", [(22, 97), (22, 5)], False),
          ("pena", [(22, 5), (34, 0)], False),
          ("fio", [(22, 86), (22, 14)], False)],
    "M": [("pena", [(4, 86), (13, 98), (13, 6), (4, 0)], False),
          ("pena", [(13, 86), (28, 100), (43, 91), (43, 6)], True),
          ("pena", [(43, 86), (58, 100), (73, 91), (73, 6), (83, 0)], True),
          ("fio", [(28, 88), (28, 14)], False),
          ("fio", [(58, 88), (58, 14)], False)],
    "'": [("pena", [(8, 100), (2, 78)], False)],
    ".": [("pena", [(6, 8), (6, 0)], False)],
}
SPACE = 34
TRACK = 4


def catmull(pts, n=10):
    if len(pts) < 3:
        return pts
    P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def densify(pts, step=2.0):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        L = math.dist(a, b)
        k = max(1, int(L / step))
        out += [(a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k) for i in range(1, k + 1)]
    return out


def nib_stroke(pts, smooth):
    path = densify(catmull(pts) if smooth else pts)
    a = math.radians(NIB_ANG)
    hx, hy = NIB_W / 2 * math.cos(a), NIB_W / 2 * math.sin(a)
    quads = []
    for p, q in zip(path, path[1:]):
        quads.append(Polygon([(p[0] - hx, p[1] - hy), (p[0] + hx, p[1] + hy),
                              (q[0] + hx, q[1] + hy), (q[0] - hx, q[1] - hy)]).convex_hull)
    return unary_union(quads)


def glyph(ch):
    parts = []
    for kind, pts, smooth in G[ch]:
        if kind == "pena":
            parts.append(nib_stroke(pts, smooth))
        else:
            parts.append(LineString(pts).buffer(HAIR / 2, cap_style=1))
    shape = unary_union(parts).buffer(0.4).buffer(-0.4)
    return shape


def inline(shape):
    inner = shape.buffer(-INLINE_IN, join_style=2)
    if inner.is_empty:
        return shape
    rings = []
    geoms = inner.geoms if hasattr(inner, "geoms") else [inner]
    for g in geoms:
        rings.append(g.exterior)
        rings.extend(g.interiors)
    cut = unary_union([LineString(r.coords).buffer(INLINE_W / 2) for r in rings])
    return shape.difference(cut)


def word(text, use_inline=True):
    """retorna (shape, largura) em coordenadas do glifo"""
    x = 0.0
    parts = []
    for ch in text:
        if ch == " ":
            x += SPACE
            continue
        g = glyph(ch)
        minx, _, maxx, _ = g.bounds
        g = affinity.translate(g, x - minx, 0)
        if use_inline and ch not in "'.":
            g = inline(g)
        parts.append(g)
        x += (maxx - minx) + TRACK
    return unary_union(parts), x - TRACK


def to_contours(shape, x, base, scale, anchor="middle", width=None):
    """converte pra contornos M/L/Z da página (y pra baixo)"""
    from shapely.geometry.polygon import orient
    if anchor == "middle":
        x -= width * scale / 2
    out = []
    geoms = shape.geoms if hasattr(shape, "geoms") else [shape]
    for g in geoms:
        if g.geom_type != "Polygon" or g.area < 0.5:
            continue
        g = orient(g, -1.0)  # vira ao espelhar y
        for ring in [g.exterior, *g.interiors]:
            cs = [(round(x + px * scale, 2), round(base - py * scale, 2)) for px, py in ring.coords[:-1]]
            out.append(["M", *cs[0]]); out.extend(["L", *c] for c in cs[1:]); out.append(["Z"])
    return out


if __name__ == "__main__":
    import sys
    from PIL import Image, ImageDraw
    txt = sys.argv[1] if len(sys.argv) > 1 else "DON'T WASTE YOUR TIME"
    out = sys.argv[2] if len(sys.argv) > 2 else "letreiro.png"
    shape, w = word(txt)
    s = 4.0
    import numpy as np
    im = np.zeros((int(150 * s), int(w * s) + 80), dtype=np.uint8)
    geoms = shape.geoms if hasattr(shape, "geoms") else [shape]
    T = lambda p: (40 + p[0] * s, 110 * s - p[1] * s)
    for g in geoms:
        for r in [g.exterior, *g.interiors]:
            m = Image.new("L", (im.shape[1], im.shape[0]), 0)
            ImageDraw.Draw(m).polygon([T(p) for p in r.coords], fill=255)
            im ^= np.array(m)
    im = Image.fromarray(np.where(im > 0, 255, 17).astype(np.uint8))
    im.save(out)
    print("largura", round(w, 1))
