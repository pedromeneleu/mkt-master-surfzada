"""Mede a emenda da volta em public/giro: passo da rotação (deslocamento da
estampa, correlação de fase), posição da gola e diferença de pixels, quadro a
quadro, atravessando o fim → começo. Repetidos aparecem com passo ~0.

Uso: py scripts/verificar_emenda.py [quadros antes] [quadros depois]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")
PECA = Path(__file__).resolve().parent.parent
GIRO = PECA.parent.parent / "public" / "pecas" / PECA.name / "giro"
N = len(list(GIRO.glob("*.jpg")))
ANTES = int(sys.argv[1]) if len(sys.argv) > 1 else 14
DEPOIS = int(sys.argv[2]) if len(sys.argv) > 2 else 20
Y0, Y1 = 150, 760  # faixa da camisa, em 1080


def cinza(i):
    return np.asarray(Image.open(GIRO / f"{i % N:03d}.jpg").convert("L").resize((1080, 1080), Image.BILINEAR), np.float32)


def faixa(a):
    b = a[Y0:Y1] - a[Y0:Y1].mean()
    return b * np.hanning(b.shape[1])[None, :] * np.hanning(b.shape[0])[:, None]


def desloc(a, b):
    R = np.fft.fft2(a).conj() * np.fft.fft2(b)
    R /= np.abs(R) + 1e-6
    c = np.fft.ifft2(R).real
    py, px = np.unravel_index(np.argmax(c), c.shape)
    w = c.shape[1]
    l, m, r = c[py, (px - 1) % w], c[py, px], c[py, (px + 1) % w]
    dx = px + (0.5 * (l - r) / (l - 2 * m + r) if (l - 2 * m + r) else 0)
    return dx - w if dx > w / 2 else dx


def gola(a):
    m = a[:400] < 45
    t = np.nonzero(m.sum(axis=1) > 20)[0][0]
    return np.nonzero(m[t : t + 40])[1].mean()


idx = list(range(N - ANTES, N)) + list(range(0, DEPOIS))
G = {i % N: cinza(i) for i in idx + [idx[-1] + 1]}
print("quadro | passo rotação (px) | gola x | dif. pixels | fundo (parede, pedestal)")
for k, i in enumerate(idx):
    j = (i + 1) % N
    passo = -desloc(faixa(G[i]), faixa(G[j]))
    dif = float(np.abs(G[i] - G[j]).mean())
    parede = float(np.abs(G[i][300:420, 10:90] - G[j][300:420, 10:90]).mean())
    pedestal = float(np.abs(G[i][1000:1075, 250:830] - G[j][1000:1075, 250:830]).mean())
    marca = "  ← emenda (fim → começo)" if i == N - 1 else ""
    print(f"  {i:3d} → {j:3d} | {passo:+5.1f} | {gola(G[j]):6.1f} | {dif:4.1f} | {parede:3.1f} {pedestal:3.1f}{marca}")
