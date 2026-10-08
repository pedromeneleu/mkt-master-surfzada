"""Prepara as imagens dos slides em public/pecas/2026-10-tributo-andy/:

- reticula/*.png: fotos livres (assets/fotos, créditos no post.md) viradas em
  retícula branca sobre transparente, a mesma linguagem das costas da camisa.
  "pontos" = grade de pontos a 45° (o sol da camisa); "linhas" = linhas
  horizontais que engrossam com a luz (os quadros Nº01–Nº04).
- arte/costas.png e arte/sol.png: a arte final das costas sem o fundo #111.

Uso: py pecas/2026-10-tributo-andy/scripts/preparar_imagens.py
     (lê a arte das costas em $MKT_DRIVE/produtos/camisa-tshirt-01/export/; depois suba
      arte/ e reticula/ para o Drive em pecas/2026-10-tributo-andy/)
"""
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PECA = Path(__file__).resolve().parent.parent
RAIZ = PECA.parent.parent
PUBLIC = RAIZ / "public" / "pecas" / PECA.name


def drive() -> Path:
    """MKT_DRIVE do ambiente ou do .env da raiz do projeto."""
    if os.environ.get("MKT_DRIVE"):
        return Path(os.environ["MKT_DRIVE"])
    env = RAIZ / ".env"
    for linha in env.read_text(encoding="utf8").splitlines() if env.exists() else []:
        chave, _, valor = linha.partition("=")
        if chave.strip() == "MKT_DRIVE" and valor.strip():
            return Path(valor.strip().strip("\"'"))
    raise SystemExit("Configure MKT_DRIVE no .env (ver docs/01-setup.md)")


ARTE = drive() / "produtos" / "camisa-tshirt-01" / "export" / "TSHIRT-01_costas_fundo-preto.png"
SS = 3  # supersampling dos pontos

# nome: (foto, recorte (x0, y0, x1, y1) em fração da foto, saída (l, a), modo, célula px, níveis (pct baixo, alto), gama, canal)
# canal "R" no mar: a água azul escurece e a espuma (branca) continua clara, como na foto de Saquarema.
RETICULAS = {
    "kauai": ("kauai-hanalei.jpg", (0.22, 0.30, 1.0, 0.95), (920, 384), "linhas", 6, (4, 99.5), 1.0, "L"),
}


def cobre(im: Image.Image, caixa, tamanho) -> Image.Image:
    """Recorta a caixa (frações) e cobre `tamanho` sem distorcer."""
    w, h = im.size
    im = im.crop((int(caixa[0] * w), int(caixa[1] * h), int(caixa[2] * w), int(caixa[3] * h)))
    alvo = tamanho[0] / tamanho[1]
    w, h = im.size
    if w / h > alvo:
        nw = int(h * alvo)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / alvo)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im.resize(tamanho, Image.LANCZOS)


def luz(im: Image.Image, niveis, gama, canal) -> np.ndarray:
    im = (im.convert("L") if canal == "L" else im.convert("RGB").getchannel(canal)).filter(ImageFilter.UnsharpMask(radius=4, percent=140, threshold=2))
    a = np.asarray(im, np.float32)
    lo, hi = np.percentile(a, niveis)
    return np.clip((a - lo) / (hi - lo), 0, 1) ** gama


def pontos(L: np.ndarray, cel: float) -> Image.Image:
    h, w = L.shape
    tela = Image.new("L", (w * SS, h * SS), 0)
    d = ImageDraw.Draw(tela)
    ca = sa = np.sqrt(0.5)  # 45°
    n = int(max(w, h) * 1.5 / cel) + 2
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            u, v = i * cel, j * cel
            x = w / 2 + u * ca - v * sa
            y = h / 2 + u * sa + v * ca
            if not (0 <= x < w and 0 <= y < h):
                continue
            k = max(1, int(cel / 2))
            t = float(L[max(0, int(y) - k) : int(y) + k + 1, max(0, int(x) - k) : int(x) + k + 1].mean())
            r = cel * np.sqrt(t * 0.80 / np.pi)
            if r < 0.9:
                continue
            d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=255)
    return tela.resize((w, h), Image.LANCZOS)


def linhas(L: np.ndarray, passo: float) -> Image.Image:
    h, w = L.shape
    tela = Image.new("L", (w * SS, h * SS), 0)
    d = ImageDraw.Draw(tela)
    y = passo / 2
    while y < h:
        faixa = L[int(y - passo / 2) : int(y + passo / 2) + 1].mean(axis=0)
        for x in range(w):
            meia = passo * 0.5 * faixa[x] * 0.92
            if meia < 0.35:
                continue
            d.rectangle([x * SS, (y - meia) * SS, (x + 1) * SS, (y + meia) * SS], fill=255)
        y += passo
    return tela.resize((w, h), Image.LANCZOS)


def sem_fundo(arte: Image.Image, fundo=17) -> Image.Image:
    """Tinta branca/coral sobre #111 → RGBA, desfazendo a mistura com o fundo."""
    a = np.asarray(arte.convert("RGB"), np.float32)
    alfa = np.clip((a.max(axis=2) - fundo) / (255 - fundo), 0, 1)
    cor = np.where(alfa[..., None] > 0.004, (a - fundo * (1 - alfa[..., None])) / np.maximum(alfa[..., None], 0.004), 0)
    rgba = np.dstack([np.clip(cor, 0, 255), alfa * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def main() -> None:
    (PUBLIC / "reticula").mkdir(parents=True, exist_ok=True)
    for nome, (foto, caixa, tamanho, modo, cel, niveis, gama, canal) in RETICULAS.items():
        L = luz(cobre(Image.open(PUBLIC / "fotos" / foto), caixa, tamanho), niveis, gama, canal)
        alfa = pontos(L, cel) if modo == "pontos" else linhas(L, cel)
        branco = Image.new("RGBA", tamanho, (255, 255, 255, 0))
        branco.putalpha(alfa)
        branco.save(PUBLIC / "reticula" / f"{nome}.png")
        print(f"reticula/{nome}.png")

    (PUBLIC / "arte").mkdir(parents=True, exist_ok=True)
    costas = sem_fundo(Image.open(ARTE))
    costas.resize((1500, 2000), Image.LANCZOS).save(PUBLIC / "arte" / "costas.png")
    # O sol: raios + círculo (centro 1771, 1500; raio dos raios 1440 no original).
    costas.crop((300, 40, 3243, 2380)).resize((1471, 1170), Image.LANCZOS).save(PUBLIC / "arte" / "sol.png")
    print("arte/costas.png, arte/sol.png")


if __name__ == "__main__":
    main()
