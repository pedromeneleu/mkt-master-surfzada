"""Gera a geometria das costas da camisa Surfzada (30x40cm @300dpi) em JSON
para o Affinity desenhar. Tudo em vetor: retícula, raios, letras, ícones."""
import json, math, os, sys
import numpy as np
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

W, H = 3543, 4724
CX = W / 2
PHOTO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saquarema.jpg")
RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(RAIZ, "out", "produtos", "camisa-tshirt-01")
os.makedirs(OUT, exist_ok=True)

WHITE = [255, 255, 255]
CORAL = [255, 122, 89]
BLACK = [10, 10, 10]

P = dict(
    sun_cy=1500, sun_r=960,
    cell=16, min_r=3.0, sharp=180, sharp_r=6, win=0.6,
    photo_cx=1130, photo_cy=760, photo_r=480,
    pct_lo=28, pct_hi=99.5, gamma=0.95,
    ray_div=56, ray_r0=1040, ray_r1=1440, ray_a0=180 - 4, ray_a1=360 + 4,
    word_size=680, font="oldengl", word_base=2660, title_w=3250, title_top=2380, title_gap=95, title_w2=3000, tex="listras", stripe_pitch=46, trama_pitch=15, diag_pitch=13, trama_t0=3.2, trama_t1=9.5, trama_cross=0.45, warp_a=40, grid_top=2960, pitch=8, eng_lo=6, eng_hi=99.8, eng_g=1.0, min_half=1.1,
)
for a in sys.argv[1:]:
    k, v = a.split("=")
    try:
        P[k] = float(v)
    except ValueError:
        P[k] = v

layers = []

def layer(name, fill=None, stroke=None, width=0, contours=None, ellipses=None):
    layers.append(dict(name=name, fill=fill, stroke=stroke, width=width,
                       contours=contours or [], ellipses=ellipses or []))

# ---------- retícula da foto dentro do sol ----------
def halftone():
    from PIL import ImageFilter
    im = Image.open(PHOTO).convert("L")
    if P["sharp"] > 0:
        im = im.filter(ImageFilter.UnsharpMask(radius=P["sharp_r"], percent=int(P["sharp"]), threshold=2))
    a = np.asarray(im, dtype=np.float32) / 255.0
    # níveis automáticos pela região do círculo (água escura some, spray estoura)
    r0 = int(P["photo_r"])
    reg = a[int(P["photo_cy"]) - r0:int(P["photo_cy"]) + r0, int(P["photo_cx"]) - r0:int(P["photo_cx"]) + r0]
    P["lo"], P["hi"] = float(np.percentile(reg, P["pct_lo"])), float(np.percentile(reg, P["pct_hi"]))
    ph, pw = a.shape
    R = P["sun_r"]; cy = P["sun_cy"]
    scale = P["photo_r"] / R  # px da foto por px da arte
    s = P["cell"]
    ang = math.radians(45)
    ca, sa = math.cos(ang), math.sin(ang)
    dots = []
    n = int(R * 1.5 / s) + 2
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            u, v = i * s, j * s
            x = CX + u * ca - v * sa
            y = cy + u * sa + v * ca
            d = math.hypot(x - CX, y - cy)
            if d > R - s * 0.6:
                continue
            px = P["photo_cx"] + (x - CX) * scale
            py = P["photo_cy"] + (y - cy) * scale
            if not (0 <= px < pw - 1 and 0 <= py < ph - 1):
                continue
            # média numa janela do tamanho da célula
            k = max(1, int(s * scale / 2 * P["win"]))
            x0, x1 = int(px) - k, int(px) + k + 1
            y0, y1 = int(py) - k, int(py) + k + 1
            L = float(a[max(0, y0):y1, max(0, x0):x1].mean())
            t = min(1.0, max(0.0, (L - P["lo"]) / (P["hi"] - P["lo"]))) ** P["gamma"]
            r = s * math.sqrt(t * 0.80 / math.pi)
            if r < P["min_r"]:
                continue
            dots.append([round(x, 1), round(y, 1), round(r, 2)])
    return dots

dots = halftone()

# ---------- raios do sol nascente ----------
def clip_poly(poly, xmin, ymin, xmax, ymax):
    def clip(pts, inside, inter):
        out = []
        for k in range(len(pts)):
            cur, prev = pts[k], pts[k - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(inter(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(inter(prev, cur))
        return out
    def ix(xc):
        return lambda p, q: (xc, p[1] + (q[1] - p[1]) * (xc - p[0]) / (q[0] - p[0]))
    def iy(yc):
        return lambda p, q: (p[0] + (q[0] - p[0]) * (yc - p[1]) / (q[1] - p[1]), yc)
    for inside, inter in [
        (lambda p: p[0] >= xmin, ix(xmin)), (lambda p: p[0] <= xmax, ix(xmax)),
        (lambda p: p[1] >= ymin, iy(ymin)), (lambda p: p[1] <= ymax, iy(ymax))]:
        poly = clip(poly, inside, inter)
        if not poly:
            break
    return poly

rays = []
rays_meta = []  # (pts, a0, a1)
div = int(P["ray_div"])
step = 360 / div
cy = P["sun_cy"]
for k in range(div):
    if k % 2:
        continue
    a0 = 270 - step / 2 + k * step  # um raio centrado no topo
    a1 = a0 + step
    mid = (a0 + a1) / 2
    m = mid % 360
    lo, hi = P["ray_a0"] % 360, P["ray_a1"] % 360
    if not (m >= lo or m <= hi):
        continue
    pts = []
    for aa in np.linspace(a0, a1, 8):
        t = math.radians(aa)
        pts.append((CX + P["ray_r1"] * math.cos(t), cy + P["ray_r1"] * math.sin(t)))
    for aa in np.linspace(a1, a0, 8):
        t = math.radians(aa)
        pts.append((CX + P["ray_r0"] * math.cos(t), cy + P["ray_r0"] * math.sin(t)))
    pts = clip_poly(pts, 60, 60, W - 60, cy + 60)
    if len(pts) >= 3:
        rays.append(pts)
        rays_meta.append((pts, a0, a1))

# ---------- textura op-art nos raios: listras onduladas vazadas ----------
def warp(x, y):
    # campo de deslocamento horizontal com "bojos", como listras de zebra distorcidas
    bump = math.exp(-((x - CX * 0.55) ** 2 + (y - 650) ** 2) / (2 * 420 ** 2)) \
         - 0.8 * math.exp(-((x - CX * 1.5) ** 2 + (y - 900) ** 2) / (2 * 380 ** 2))
    return (P["warp_a"] * math.sin(2 * math.pi * y / 980 + x / 520)
            + 0.55 * P["warp_a"] * math.sin(2 * math.pi * y / 430 + 1.7 + x / 260)
            + 2.2 * P["warp_a"] * bump * math.sin(2 * math.pi * y / 600 + 0.4))

def ray_pattern():
    """padrão (shapely) e modo: 'cut' vaza o padrão dos raios, 'keep' mantém só o padrão"""
    from shapely.geometry import Polygon, Point
    from shapely.ops import unary_union
    tex = P["tex"]
    if tex == "listras":
        pitch = P["stripe_pitch"]
        ys = np.arange(0, cy + 200, 10.0)
        stripes = []
        x = -200.0
        while x < W + 200:
            wd = pitch * (0.42 + 0.14 * math.sin(x / 210.0))
            left = [(x + warp(x, y), y) for y in ys]
            right = [(x + wd + warp(x + wd, y), y) for y in ys]
            stripes.append(Polygon(left + right[::-1]))
            x += pitch
        return unary_union(stripes), "cut"
    if tex == "pontos":
        # retícula que esvazia do sol pra fora
        s = 30.0
        dots = []
        r0, r1 = P["ray_r0"], P["ray_r1"]
        j = 0
        y = 40.0
        while y < cy + 80:
            x = 40.0 + (s / 2 if j % 2 else 0)
            while x < W - 40:
                d = math.hypot(x - CX, y - cy)
                t = (d - r0) / (r1 - r0)
                if -0.1 < t < 1.05:
                    r = s * 0.62 * max(0.0, 1 - max(0.0, t)) ** 0.9
                    if r > 2.2:
                        dots.append(Point(x, y).buffer(r, 12))
                x += s
            y += s * 0.866; j += 1
        return unary_union(dots), "keep"
    if tex in ("ondas", "topo"):
        # anéis concêntricos distorcidos; 'topo' usa centro deslocado e ruído forte (curvas de nível)
        if tex == "ondas":
            c0, pitch, amp = (CX, cy), 44.0, 10.0
        else:
            c0, pitch, amp = (CX - 380, cy - 620), 34.0, 55.0
        th = np.linspace(0, 2 * math.pi, 720, endpoint=False)
        def ring(R, k):
            if tex == "ondas":
                rr = R + amp * np.sin(9 * th + R / 90) + 0.6 * amp * np.sin(23 * th - R / 60)
            else:
                rr = R * (1 + 0.22 * np.sin(2 * th + 0.8 + R / 900) + 0.12 * np.sin(4 * th + R / 260)
                          + 0.06 * np.sin(9 * th - R / 150)) + amp * np.sin(3 * th + R / 120)                      + 0.6 * amp * np.sin(7 * th - R / 80)
            return Polygon(list(zip(c0[0] + rr * np.cos(th), c0[1] + rr * np.sin(th))))
        bands = []
        R = pitch
        while R < 3200:
            wd = pitch * (0.40 if tex == "ondas" else 0.34)
            outer, inner = ring(R + wd, 0), ring(R, 0)
            band = outer.buffer(0).difference(inner.buffer(0))
            bands.append(band)
            R += pitch
        return unary_union(bands), "cut"
    if tex == "gravura":
        # raios finos saindo do centro, afinando pra fora (gravura em metal)
        lines = []
        n = 150
        for k in range(n):
            a = math.pi + math.pi * k / (n - 1) - 0.08 + 0.16 * k / (n - 1)
            a = math.pi + (math.pi + 0.16) * k / (n - 1) - 0.08
            ux, uy = math.cos(a), math.sin(a)
            px, py = -uy, ux
            r0, r1 = P["ray_r0"] - 40, P["ray_r1"] + 40
            w0, w1 = 9.0, 3.5
            pts = [(CX + ux * r0 + px * w0, cy + uy * r0 + py * w0), (CX + ux * r1 + px * w1, cy + uy * r1 + py * w1),
                   (CX + ux * r1 - px * w1, cy + uy * r1 - py * w1), (CX + ux * r0 - px * w0, cy + uy * r0 - py * w0)]
            lines.append(Polygon(pts))
        return unary_union(lines), "cut"
    return None, None

def ray_contours(pts_list):
    from shapely.geometry import Polygon, MultiPolygon
    from shapely.geometry.polygon import orient
    from shapely.ops import unary_union
    shape = unary_union([Polygon(p) for p in pts_list])
    pat, mode = ray_pattern()
    if pat is not None:
        shape = shape.difference(pat) if mode == "cut" else shape.intersection(pat)
    geoms = shape.geoms if hasattr(shape, "geoms") else [shape]
    out = []
    for g in geoms:
        if g.geom_type != "Polygon" or g.area < 30:
            continue
        g = orient(g, 1.0)
        for ring in [g.exterior, *g.interiors]:
            cs = [(round(a, 1), round(b, 1)) for a, b in ring.coords[:-1]]
            out.append(["M", *cs[0]]); out.extend(["L", *c] for c in cs[1:]); out.append(["Z"])
    return out


# ---------- materiais: volume e brilho dentro de cada raio (coral + branco) ----------
def shapes_to_contours(shape):
    from shapely.geometry.polygon import orient
    out = []
    geoms = shape.geoms if hasattr(shape, "geoms") else [shape]
    for g in geoms:
        if g.geom_type != "Polygon" or g.area < 12:
            continue
        g = orient(g, 1.0)
        for ring in [g.exterior, *g.interiors]:
            cs = [(round(a, 1), round(b, 1)) for a, b in ring.coords[:-1]]
            out.append(["M", *cs[0]]); out.extend(["L", *c] for c in cs[1:]); out.append(["Z"])
    return out

def ray_material():
    """retorna (coral, branco) como contornos; None se o modo não é material"""
    from shapely.geometry import Polygon, Point
    from shapely.ops import unary_union
    tex = P["tex"]
    if tex not in ("bisel", "granulado", "tubo", "cromado", "trama", "diagonal"):
        return None
    r0, r1 = P["ray_r0"], P["ray_r1"]
    rng = np.random.default_rng(7)
    def to_xy(a0, a1, u, v):
        t = math.radians(a0 + u * (a1 - a0)); r = r0 + v * (r1 - r0)
        return (CX + r * math.cos(t), cy + r * math.sin(t))
    def uv_poly(a0, a1, ring):
        return Polygon([to_xy(a0, a1, u, v) for u, v in ring]).buffer(0)
    def band_v(a0, a1, v, th, ua=0.0, ub=1.0, n=24):
        # faixa ao longo do raio (v constante), espessura th(u) em unidades de v
        us = np.linspace(ua, ub, n)
        top = [(u, v - th(u) / 2) for u in us]
        bot = [(u, v + th(u) / 2) for u in us[::-1]]
        return uv_poly(a0, a1, top + bot)
    def band_u(a0, a1, u, th, va=0.0, vb=1.0, n=24):
        # faixa radial (u constante), espessura th(v) em unidades de u
        vs = np.linspace(va, vb, n)
        left = [(u - th(v) / 2, v) for v in vs]
        right = [(u + th(v) / 2, v) for v in vs[::-1]]
        return uv_poly(a0, a1, left + right)
    coral_all, white_all = [], []
    for pts, a0, a1 in rays_meta:
        ray = Polygon(pts).buffer(0)
        cut, white = [], []
        if tex == "bisel":
            # face da direita na sombra: arcos hachurados que engrossam pra borda
            for k in range(1, 40):
                v = k * 0.042
                if v > 0.98: break
                cut.append(band_v(a0, a1, v, lambda u: 0.012 + 0.014 * ((u - 0.5) / 0.5) ** 0.8, 0.5, 0.985))
            # aresta: filete branco afinando nas pontas
            white.append(band_u(a0, a1, 0.49, lambda v: 0.05 * math.sin(math.pi * min(1, max(0, (v - 0.04) / 0.92))) ** 0.6, 0.04, 0.96))
            # brilho na borda iluminada
            white.append(band_u(a0, a1, 0.035, lambda v: 0.025 * math.sin(math.pi * v) ** 0.8, 0.0, 1.0))
        elif tex == "granulado":
            area = ray.area
            n = int(area / 60)
            xs = rng.uniform(*ray.bounds[0::2], n * 3); ys = rng.uniform(*ray.bounds[1::2], n * 3)
            for x, y in zip(xs, ys):
                r = math.hypot(x - CX, y - cy); v = (r - r0) / (r1 - r0)
                t = math.degrees(math.atan2(y - cy, x - CX)) % 360
                u = ((t - a0) % 360) / (a1 - a0)
                if not (0 <= u <= 1 and 0 <= v <= 1): continue
                edge = max(0.0, 1 - min(u, 1 - u) / 0.2)
                p = 0.05 + 0.55 * v ** 1.6 + 0.45 * edge ** 2
                if rng.random() < p * 0.55:
                    cut.append(Point(x, y).buffer(rng.uniform(3.2, 6.5), 6))
                elif v < 0.45 and 0.15 < u < 0.5 and rng.random() < 0.10 * (1 - v / 0.45):
                    white.append(Point(x, y).buffer(rng.uniform(2.6, 4.2), 6))
        elif tex == "tubo":
            m = 16
            for k in range(1, m):
                u = k / m
                b = max(0.0, math.cos(math.pi * (u - 0.44) / 0.95))   # cilindro: escuro nas duas bordas
                th0 = (1 / m) * 0.9 * (1 - b) ** 0.85
                if th0 < 0.02: continue
                cut.append(band_u(a0, a1, u, lambda v, th0=th0: th0 * (0.75 + 0.25 * v)))
            white.append(band_u(a0, a1, 0.27, lambda v: 0.07 * math.sin(math.pi * min(1, max(0, (v - 0.05) / 0.9))) ** 0.7, 0.05, 0.95))
        elif tex == "cromado":
            ph = (a0 / 360) * 7.0
            wv = lambda u, c, amp=0.035: c + amp * math.sin(2 * math.pi * (1.1 * u + ph))
            us = np.linspace(0, 1, 30)
            def wave_band(c1, c2, amp=0.035):
                top = [(u, wv(u, c1, amp)) for u in us]; bot = [(u, wv(u, c2, amp)) for u in us[::-1]]
                return uv_poly(a0, a1, top + bot)
            cut.append(wave_band(0.36, 0.385))
            white.append(wave_band(0.41, 0.53))
            cut.append(wave_band(0.555, 0.575))
            for k in range(7):
                c = 0.62 + k * 0.055
                cut.append(wave_band(c, c + 0.006 + 0.004 * k, 0.025))
            white.append(wave_band(0.12, 0.15, 0.02))
        elif tex == "trama":
            # hachura diagonal que engrossa pra ponta + segunda diagonal cruzada na metade de fora
            mid = math.radians((a0 + a1) / 2)
            dx, dy = math.cos(mid), math.sin(mid)          # eixo do raio (pra fora)
            px, py = -dy, dx                                 # perpendicular
            pitch = P["trama_pitch"]
            def thick(r):
                v = min(1.0, max(0.0, (r - r0) / (r1 - r0)))
                return P["trama_t0"] + (P["trama_t1"] - P["trama_t0"]) * v ** 1.3
            for sgn, vstart in ((1, 0.0), (-1, P["trama_cross"])):
                ang = math.radians(45) * sgn
                ux, uy = dx * math.cos(ang) - dy * math.sin(ang), dx * math.sin(ang) + dy * math.cos(ang)
                nx, ny = -uy, ux
                ccx, ccy = CX + dx * (r0 + r1) / 2, cy + dy * (r0 + r1) / 2
                for k in range(-40, 41):
                    ox_, oy_ = ccx + nx * k * pitch, ccy + ny * k * pitch
                    left, right = [], []
                    for s in np.linspace(-420, 420, 60):
                        x_, y_ = ox_ + ux * s, oy_ + uy * s
                        r = math.hypot(x_ - CX, y_ - cy)
                        v = (r - r0) / (r1 - r0)
                        w = thick(r) if v >= vstart else 0.0
                        if sgn < 0 and v >= vstart:
                            w *= min(1.0, (v - vstart) / 0.15)
                        left.append((x_ + nx * w / 2, y_ + ny * w / 2)); right.append((x_ - nx * w / 2, y_ - ny * w / 2))
                    poly = Polygon(left + right[::-1]).buffer(0)
                    if not poly.is_empty and poly.intersects(ray):
                        cut.append(poly)
        elif tex == "diagonal":
            # linhas diagonais finas num só sentido; o vão preto cresce pra ponta (degradê)
            mid = math.radians((a0 + a1) / 2)
            dx, dy = math.cos(mid), math.sin(mid)
            ang = math.radians(40)
            ux, uy = dx * math.cos(ang) - dy * math.sin(ang), dx * math.sin(ang) + dy * math.cos(ang)
            nx, ny = -uy, ux
            pitch = P["diag_pitch"]
            ccx, ccy = CX + dx * (r0 + r1) / 2, cy + dy * (r0 + r1) / 2
            for k in range(-50, 51):
                ox_, oy_ = ccx + nx * k * pitch, ccy + ny * k * pitch
                left, right = [], []
                for s in np.linspace(-420, 420, 70):
                    x_, y_ = ox_ + ux * s, oy_ + uy * s
                    v = min(1.0, max(0.0, (math.hypot(x_ - CX, y_ - cy) - r0) / (r1 - r0)))
                    w = pitch * (0.18 + 0.52 * v ** 1.1)
                    left.append((x_ + nx * w / 2, y_ + ny * w / 2)); right.append((x_ - nx * w / 2, y_ - ny * w / 2))
                poly = Polygon(left + right[::-1]).buffer(0)
                if not poly.is_empty and poly.intersects(ray):
                    cut.append(poly)
        c_shape = ray.difference(unary_union(cut)) if cut else ray
        w_shape = unary_union(white).intersection(c_shape) if white else None
        coral_all.append(c_shape)
        if w_shape is not None and not w_shape.is_empty:
            white_all.append(w_shape)
    coral = unary_union(coral_all)
    white = unary_union(white_all) if white_all else None
    return shapes_to_contours(coral), (shapes_to_contours(white) if white is not None else [])

_mat = ray_material()
ray_white = []
if _mat:
    ray_paths, ray_white = _mat
else:
    ray_paths = ray_contours(rays)

# ---------- texto -> curvas ----------
class Rec(BasePen):
    def __init__(self, gs, tf):
        super().__init__(gs); self.c = []; self.tf = tf; self.cur = None
    def _moveTo(self, p):
        self.c.append(["M", *self.tf(p)]); self.cur = p
    def _lineTo(self, p):
        self.c.append(["L", *self.tf(p)]); self.cur = p
    def _curveToOne(self, p1, p2, p3):
        self.c.append(["C", *self.tf(p1), *self.tf(p2), *self.tf(p3)]); self.cur = p3
    def _qCurveToOne(self, p1, p2):
        p0 = self.cur
        c1 = (p0[0] + 2 / 3 * (p1[0] - p0[0]), p0[1] + 2 / 3 * (p1[1] - p0[1]))
        c2 = (p2[0] + 2 / 3 * (p1[0] - p2[0]), p2[1] + 2 / 3 * (p1[1] - p2[1]))
        self._curveToOne(c1, c2, p2)
    def _closePath(self):
        self.c.append(["Z"])
    _endPath = _closePath

FONTS = {}
def font(name):
    if name not in FONTS:
        f = TTFont(os.path.join(r"C:\Windows\Fonts", name))
        FONTS[name] = (f, f.getGlyphSet(), f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)
    return FONTS[name]

def text_width(txt, fname, size, track=0):
    f, gs, cmap, hmtx, upm = font(fname)
    sc = size / upm
    return sum(hmtx[cmap[ord(ch)]][0] * sc + track for ch in txt) - track

def text(txt, fname, size, x, base, track=0, anchor="middle"):
    f, gs, cmap, hmtx, upm = font(fname)
    sc = size / upm
    w = text_width(txt, fname, size, track)
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    out = []
    for ch in txt:
        g = cmap[ord(ch)]
        ox = x
        pen = Rec(gs, lambda p, ox=ox: (round(ox + p[0] * sc, 2), round(base - p[1] * sc, 2)))
        gs[g].draw(pen)
        out += pen.c
        x += hmtx[g][0] * sc + track
    return out, w

# ---------- montagem ----------
layer("Camisa preta (preview, esconder no export)", fill=[17, 17, 17],
      contours=[["M", 0, 0], ["L", W, 0], ["L", W, H], ["L", 0, H], ["Z"]])
layer("Raios (coral)", fill=CORAL, contours=ray_paths)
if ray_white:
    layer("Raios - brilho (branco)", fill=WHITE, contours=ray_white)
layer("Retícula Saquarema", fill=WHITE, ellipses=dots)
ring = P["sun_r"] + 22
layer("Aro do sol", stroke=WHITE, width=12, ellipses=[[CX, cy, ring]])

if P["font"] == "letreiro":
    import letreiro
    LINES = ["DON'T WASTE", "YOUR TIME"]
    shapes = [letreiro.word(t) for t in LINES]
    wmax = max(w for _, w in shapes)
    lsc = P["title_w2"] / wmax
    word, ww = [], wmax * lsc
    cap = 100 * lsc
    for k, (shp, w) in enumerate(shapes):
        base = P["title_top"] + cap + k * (cap + P["title_gap"])
        word += letreiro.to_contours(shp, CX, base, lsc, width=w)
else:
    TITLE = "Don’t Waste Your Time"
    tw = text_width(TITLE, "OLDENGL.TTF", 100)
    tsize = min(P["word_size"], 100 * P["title_w"] / tw)
    word, ww = text(TITLE, "OLDENGL.TTF", tsize, CX, P["word_base"])
layer("Título - recorte", fill=BLACK, stroke=BLACK, width=60, contours=word)
layer("Título Don't Waste Time", fill=WHITE, contours=word)

# grade de espécimes: 4 recortes da foto em gravura de linhas
from PIL import ImageFilter
photo = Image.open(PHOTO).convert("L").filter(ImageFilter.UnsharpMask(radius=4, percent=160, threshold=2))
bw, bh, gap = 560, 420, 50
top = P["grid_top"]
x0 = CX - (4 * bw + 3 * gap) / 2
CROPS = [("CRISTA", 1071, 645, 323), ("LÁBIO", 1215, 735, 175),
         ("ESPUMA", 1843, 1200, 380), ("HORIZONTE", 1500, 235, 300)]

def engrave(cx, cy, hw, bx, by, pitch=P["pitch"]):
    hh = hw * bh / bw
    crop = photo.crop((int(cx - hw), int(cy - hh), int(cx + hw), int(cy + hh))).resize((bw, bh), Image.LANCZOS)
    a = np.asarray(crop, dtype=np.float32) / 255.0
    lo, hi = np.percentile(a, P["eng_lo"]), np.percentile(a, P["eng_hi"])
    t = np.clip((a - lo) / (hi - lo), 0, 1) ** P["eng_g"]
    out = []
    step, pad = 3, 14
    rows = int((bh - 2 * pad) // pitch)
    for i in range(rows):
        yc = by + pad + pitch / 2 + i * pitch
        yy = int(yc - by)
        band = t[max(0, yy - int(pitch / 2)):yy + int(pitch / 2) + 1].mean(axis=0)
        xs = list(range(pad, bw - pad + 1, step))
        half = [float(pitch / 2 * 0.92 * band[min(x, bw - 1)]) for x in xs]
        seg = []
        def emit(seg):
            if len(seg) < 2:
                return
            tp = [(bx + x, round(yc - h, 1)) for x, h in seg]
            bt = [(bx + x, round(yc + h, 1)) for x, h in reversed(seg)]
            pts = tp + bt
            out.append(["M", *pts[0]]); out.extend(["L", *p] for p in pts[1:]); out.append(["Z"])
        for x, h in zip(xs, half):
            if h >= P["min_half"]:
                seg.append((x, h))
            else:
                emit(seg); seg = []
        emit(seg)
    return out

boxes, engr, labels = [], [], []
for i, (name, cx_, cy_, hw) in enumerate(CROPS):
    bx = x0 + i * (bw + gap)
    boxes.append([["M", bx, top], ["L", bx + bw, top], ["L", bx + bw, top + bh],
                  ["L", bx, top + bh], ["Z"]])
    engr += engrave(cx_, cy_, hw, bx, top)
    t1, _ = text(f"N\u00BA0{i+1}", "GOTHICB.TTF", 36, bx, top - 26, track=4, anchor="start")
    t2, _ = text(name, "GOTHICB.TTF", 36, bx + bw, top - 26, track=6, anchor="end")
    labels += t1 + t2
layer("Grade - quadros", stroke=WHITE, width=6, contours=[c for b in boxes for c in b])
layer("Grade - gravuras", fill=WHITE, contours=engr)
layer("Grade - rótulos", fill=WHITE, contours=labels)

cap_lines = [
    "O MAR N\u00c3O ESPERA NINGU\u00c9M. A ONDA QUE PASSOU N\u00c3O VOLTA MAIS.",
    "CADA S\u00c9RIE ACONTECE UMA VEZ S\u00d3, E O RESTO \u00c9 DESCULPA.",
    "ACORDA CEDO, CHAMA A GALERA E REMA.",
]
cap = []
for k, ln in enumerate(cap_lines):
    c, _ = text(ln, "GOTHICB.TTF", 50, CX, top + bh + 130 + k * 72, track=5)
    cap += c
layer("Legenda", fill=WHITE, contours=cap)

foot, fw = text("ACERVO  SURFZADA.COM.BR", "GOTHICB.TTF", 58, CX, top + bh + 470, track=12)
layer("Rodapé - site", fill=WHITE, contours=foot)
coord, _ = text("Nº 001  ·  22°56'S  42°29'W  ·  SAQUAREMA", "GOTHIC.TTF", 38, CX,
                top + bh + 540, track=8)
layer("Rodapé - coordenadas", fill=WHITE, contours=coord)
# ponto coral separador
layer("Rodapé - sol", fill=CORAL, ellipses=[[CX - fw / 2 - 60, top + bh + 450, 16],
                                              [CX + fw / 2 + 60, top + bh + 450, 16]])

with open(os.path.join(OUT, P.get("out", "back.json")), "w", encoding="utf-8") as fh:
    json.dump(dict(W=W, H=H, layers=layers), fh)
print("dots", len(dots), "rays", len(rays), "word width", round(ww), "->", OUT)
