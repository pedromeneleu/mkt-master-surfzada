"""Prepara o giro da camisa para o Remotion: public/giro/000.jpg…224.jpg.

O vídeo (shot_01_v11, já em 2160×2160, 239 quadros a 30 fps) entra em
resolução cheia, para a Capa sair nítida em 2160 e em 1080. O OffthreadVideo
não consegue buscar quadros nos vídeos da super-resolução ("No frame found at
position"), então o Remotion toca a sequência de JPGs.

Por que a volta não fecha sozinha (medido em scratchpad, ver README):
- O vídeo foi gerado a 24 fps e convertido para 30 repetindo 1 quadro a cada 5
  (48 repetidos, 190 únicos).
- A rotação "dá a partida": nos quadros 0–8 a estampa anda ~1 px/quadro (em
  1080), depois ~4,7. No fim (222–238) anda ~2,5–3.
- A camisa balança: no fim a gola vem para a esquerda, no começo vai para a
  direita.
Emendar 238 → 0 dava uma travadinha: a rotação quase parava e o balanço
invertia de uma vez.

Como a volta é montada (só a emenda e a retomada são sintetizadas; o resto é
quadro original):
1. ENTRADA: a volta começa no quadro 8, depois da partida lenta.
2. PARES: os 4 últimos quadros únicos (234, 236, 237, 238) são deformados por
   fluxo óptico até os quadros da partida que estão na mesma fase da rotação
   (0, 3, 6, 7), com peso 0,25 → 1. Posição e forma passam de um para o outro
   sem fantasma, e o último (o próprio 7) desemboca no 8 como no vídeo.
   O balanço é compensado com DESVIO: a camisa (só ela; o estúdio fica parado)
   vai uns pixels para a esquerda ao longo da chegada à emenda e volta devagar
   depois.
3. RETOMADA: o começo do vídeo dá uma arrancada (a estampa anda 4–5,7 px por
   quadro nos quadros 10–27, contra ~2,5–3 no fim). Até o quadro RETOMA_ATE a
   volta toca no ritmo do fim (VEL), com as posições tiradas da fase medida da
   estampa e os intermediários por fluxo. Sem arrancada, sem virada rápida.
4. Os quadros repetidos da conversão 24 → 30 são redistribuídos nas POR_VOLTA
   posições, o mais espaçados possível e fora da emenda. Com 225 por volta,
   4 voltas = 900 quadros = 30 s exatos, e o fim do vídeo emenda no começo.
5. O selo "AI" do canto é apagado: o retângulo é refeito interpolando a parede
   cinza a partir das bordas (Coons), com grão para casar com o vídeo.

Uso: py scripts/preparar_giro.py "C:/caminho/shot_01_v11.mp4 - Super-resoluçã.mp4"
"""
import shutil
import subprocess
import sys
import tempfile
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows (cp1252) não imprime → nem acentos

PECA = Path(__file__).resolve().parent.parent
RAIZ = PECA.parent.parent
SAIDA = RAIZ / "public" / "pecas" / PECA.name / "giro"

POR_VOLTA = 225  # 30 s × 30 fps / 4 voltas (tem de bater com DURACAO_GIRO em src/componentes/GiroEmLoop.tsx)
ENTRADA = 8  # primeiro quadro da volta, depois da partida lenta
# Fim → partida na mesma fase da rotação (deslocamento da estampa em relação ao quadro 0, em 1080):
# 234: −0,9 ↔ 0: 0 · 236: +2,1 ↔ 3: +2,4 · 237: +5,1 ↔ 6: +4,6 · 238: +6,0 ↔ 7: +6,6
# Peso 0,25 → 1: o último já é o próprio 7, então 7 → 8 é um passo natural do vídeo.
PARES = [(234, 0, 0.25), (236, 3, 0.5), (237, 6, 0.75), (238, 7, 1.0)]

# Arrancada: depois da partida, o vídeo dá uma arrancada (quadros 10–27: a estampa anda 4–5,7 px/quadro em
# 1080) e volta a ~2–3. No fim (222–238) anda ~2,5–3. Emendado direto, a camisa saía do ritmo do fim, arrancava
# e freava: uma virada rápida. Do ENTRADA até RETOMA_ATE a volta toca com a estampa andando VEL px/quadro
# (o ritmo do fim, contando os repetidos): as posições saem da fase medida da estampa, e as fracionárias são
# interpoladas por fluxo. Do RETOMA_ATE em diante segue o vídeo, que ali já anda nesse ritmo.
RETOMA_ATE, VEL = 30, 3.0
FAIXA_ESTAMPA = (300, 650)  # linhas (em 1080) onde a fase da estampa é medida

# Balanço: no fim a camisa vem para a esquerda; o começo do vídeo está ~8 px (em 1080) mais à direita. O
# desvio (px em 2160, negativo = esquerda) é uma curva suave em torno da virada (ver desvio()): sobe de
# DESVIO_DE até DESVIO_PICO_EM quadros e volta a zero em DESVIO_ATE, sem empurrão.
# Só a camisa se move, em pixels inteiros (sem reamostrar); a parede e o pedestal ficam parados, e a faixa
# que a camisa descobre vem de um fundo limpo do estúdio (mediana da parede ao longo do giro).
DESVIO, DESVIO_DE, DESVIO_PICO_EM, DESVIO_ATE = 18, -16, 6, 80
SELO = (1966, 2050, 2106, 2126)  # x0, y0, x1, y1 do selo "AI", com folga
GRAO = 1.4

PASTA: Path  # quadros extraídos (definida em main)


@lru_cache(maxsize=6)
def quadro(n: int) -> np.ndarray:
    return np.asarray(Image.open(PASTA / f"q{n:03d}.png").convert("RGB"))


@lru_cache(maxsize=8)
def fluxo(a: int, b: int) -> np.ndarray:
    """Fluxo óptico denso (DIS) do quadro a para o b, em resolução cheia."""
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    # Mais fino que o preset: a borda da manga contra a parede lisa é onde o fluxo erra.
    dis.setFinestScale(0)
    dis.setGradientDescentIterations(25)
    dis.setVariationalRefinementIterations(10)
    ga = cv2.cvtColor(quadro(a), cv2.COLOR_RGB2GRAY)
    gb = cv2.cvtColor(quadro(b), cv2.COLOR_RGB2GRAY)
    return dis.calc(ga, gb, None)


def funde(a: int, b: int, w: float, protege: bool = False) -> np.ndarray:
    """Quadro intermediário entre a e b (w = 0 → a, 1 → b), com camisa e parede tratadas à parte:

    - a camisa: cada quadro é deformado pelo fluxo até a posição intermediária e os dois se misturam
      (Lanczos, para não amolecer). Com `protege` (a emenda, onde os quadros são de pontas diferentes
      do vídeo), onde as duas deformadas discordam o peso puxa para a mais próxima no tempo, em vez de
      virar dupla exposição;
    - o contorno: as silhuetas dos dois quadros, deformadas pelo mesmo fluxo;
    - a parede: está parada, então vem dos quadros originais sem deformar (o fluxo é instável no liso
      e borrava a borda da camisa com a parede); onde nenhum dos dois mostra parede, o fundo limpo.
    """
    A, B = quadro(a).astype(np.float32), quadro(b).astype(np.float32)
    h, l = A.shape[:2]
    gx, gy = np.meshgrid(np.arange(l, dtype=np.float32), np.arange(h, dtype=np.float32))
    fab, fba = fluxo(a, b), fluxo(b, a)
    xa, ya = gx - w * fab[..., 0], gy - w * fab[..., 1]
    xb, yb = gx - (1 - w) * fba[..., 0], gy - (1 - w) * fba[..., 1]
    ia = cv2.remap(A, xa, ya, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    ib = cv2.remap(B, xb, yb, cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    peso = w
    if protege:
        discorda = cv2.GaussianBlur(np.abs(ia - ib).mean(axis=2), (0, 0), 7)
        s = np.clip((discorda - 10) / 14, 0, 1)[..., None]
        peso = (1 - s) * w + s * (1.0 if w >= 0.5 else 0.0)

    sa, sb = silhueta(A), silhueta(B)
    ma = cv2.GaussianBlur(cv2.remap(sa.astype(np.float32), xa, ya, cv2.INTER_LINEAR), (0, 0), 2)
    mb = cv2.GaussianBlur(cv2.remap(sb.astype(np.float32), xb, yb, cv2.INTER_LINEAR), (0, 0), 2)
    m = np.clip(((1 - w) * ma + w * mb - 0.5) * 2.5 + 0.5, 0, 1)
    m = cv2.GaussianBlur(m, (0, 0), 1.5)[..., None]
    # Na camisa, cada deformada só entra onde ela própria é camisa (o fluxo às vezes arrasta parede).
    pa, pb = (1 - peso) * ma[..., None] ** 2, peso * mb[..., None] ** 2
    camisa = (ia * pa + ib * pb + 1e-3 * (ia * (1 - peso) + ib * peso)) / (pa + pb + 1e-3)

    va, vb = 1 - suave(sa, 6, 2), 1 - suave(sb, 6, 2)  # onde cada original mostra parede
    num = A * va * (1 - w) + B * vb * w
    den = va * (1 - w) + vb * w
    alfa = np.clip(den / 0.3, 0, 1)
    plano = parede_do_quadro(A, sa, np.random.default_rng(a * 1000 + b))
    parede = num / np.maximum(den, 1e-3) * alfa + plano * (1 - alfa)
    return camisa * m + parede * (1 - m)


FUNDO: np.ndarray  # o estúdio sem a camisa (definido em main)


def fundo_limpo(total: int) -> np.ndarray:
    """O estúdio sem a camisa: mediana por pixel, ao longo do giro, só dos quadros em que ali aparece
    parede, longe da borda da camisa (a super-resolução deixa um brilho fino junto da borda, que o
    máximo acumularia em linhas). A parede é lisa: calcula em 540 e amplia."""
    l = 540
    amostras = []
    for n in range(0, total, 4):
        q = cv2.resize(quadro(n), (l, l), interpolation=cv2.INTER_AREA).astype(np.float32)
        camisa = (cv2.cvtColor(q.astype(np.uint8), cv2.COLOR_RGB2GRAY) < 70).astype(np.uint8)
        perto = cv2.dilate(camisa, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))).astype(bool)
        q[perto] = np.nan
        amostras.append(q)
    plano = np.nanmedian(np.stack(amostras), axis=0)
    # Onde a camisa sempre esteve (o eixo do giro) não há parede: preenche pelo entorno (não é usado).
    falta = np.isnan(plano[..., 0]).astype(np.uint8)
    plano = cv2.inpaint(np.nan_to_num(plano).astype(np.uint8), falta, 9, cv2.INPAINT_TELEA)
    return cv2.resize(plano, quadro(0).shape[1::-1], interpolation=cv2.INTER_CUBIC).astype(np.float32)


def silhueta(img: np.ndarray) -> np.ndarray:
    """Silhueta da camisa (0/1): o preto do tecido, com a estampa preenchida por dentro."""
    m = (cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY) < 60).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    fora = m.copy()
    cv2.floodFill(fora, np.zeros((m.shape[0] + 2, m.shape[1] + 2), np.uint8), (0, 0), 1)
    return m | (1 - fora)  # buracos (a estampa) viram camisa


def suave(m: np.ndarray, dilata: int, borda: float) -> np.ndarray:
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dilata + 1, 2 * dilata + 1)))
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), borda)[..., None]


def parede_do_quadro(img: np.ndarray, m: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """O fundo limpo acertado ao brilho da parede deste quadro (correção local, por convolução
    normalizada só sobre a parede visível), com o grão do vídeo."""
    visivel = 1 - suave(m, 26, 0.01)[..., 0]
    d = (img - FUNDO).mean(axis=2) * visivel
    corr = cv2.GaussianBlur(d, (0, 0), 14) / np.maximum(cv2.GaussianBlur(visivel, (0, 0), 14), 1e-3)
    return FUNDO + corr[..., None] + rng.normal(0, GRAO, img.shape[:2])[..., None]


def desloca(img: np.ndarray, dx: int, rng: np.random.Generator) -> np.ndarray:
    """Move só a camisa dx pixels inteiros (negativo = esquerda), sem reamostrar. A parede e o pedestal
    ficam parados. A camisa leva junto uma faixa de 20 px em volta (o escurecimento de contato da
    borda); a faixa que ela descobre vem do fundo limpo acertado a este quadro."""
    if dx == 0:
        return img
    m = silhueta(img)
    leva = suave(m, 20, 8)  # o que se move: camisa + faixa de contato
    tira = suave(m, 34, 12)  # o que sai do lugar antigo (maior e bem esfumado, para não sobrar contorno)
    parede = img * (1 - tira) + parede_do_quadro(img, m, rng) * tira
    leva_d = np.roll(leva, dx, axis=1)
    return np.roll(img, dx, axis=1) * leva_d + parede * (1 - leva_d)


def apaga_selo(img: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    x0, y0, x1, y1 = SELO
    b = 4  # faixa de borda usada como amostra
    esq = img[y0:y1, x0 - b : x0].mean(axis=1)  # (h, 3)
    dir_ = img[y0:y1, x1 : x1 + b].mean(axis=1)
    cima = img[y0 - b : y0, x0:x1].mean(axis=0)  # (w, 3)
    baixo = img[y1 : y1 + b, x0:x1].mean(axis=0)
    h, w = y1 - y0, x1 - x0
    u = np.linspace(0, 1, w)[None, :, None]
    v = np.linspace(0, 1, h)[:, None, None]
    horiz = esq[:, None] * (1 - u) + dir_[:, None] * u
    vert = cima[None] * (1 - v) + baixo[None] * v
    cantos = (
        img[y0, x0] * (1 - u) * (1 - v) + img[y0, x1] * u * (1 - v) + img[y1, x0] * (1 - u) * v + img[y1, x1] * u * v
    )
    out = img.astype(np.float32).copy()
    out[y0:y1, x0:x1] = horiz + vert - cantos + rng.normal(0, GRAO, (h, w, 1))
    return out


def unicos(total: int) -> list[int]:
    """Índices dos quadros que não repetem o anterior (a conversão 24 → 30 fps).
    Um passo normal muda ~2–5 níveis de cinza em média; um repetido, menos de 0,7."""
    cinza = [np.asarray(Image.open(PASTA / f"q{n:03d}.png").convert("L").resize((540, 540), Image.BILINEAR), np.float32) for n in range(total)]
    passos = np.array([np.inf] + [np.abs(cinza[i] - cinza[i - 1]).mean() for i in range(1, total)])
    limite = 0.3 * float(np.median(passos[1:]))
    return [n for n in range(total) if passos[n] >= limite]


def desvio(i: int, total: int) -> int:
    """Desvio horizontal (px, 2160) do quadro i da volta (i já com os repetidos). É uma curva só, em
    relação à virada (t = 0 no primeiro quadro depois dela, negativo antes): sobe suave de
    DESVIO_DE até DESVIO_PICO_EM (cobrindo os ~8 px de diferença e dando um pouco de embalo bem onde
    a rotação afrouxa, na emenda) e desce suave até DESVIO_ATE."""
    t = i if i < total / 2 else i - total
    suave_ = lambda x: x * x * (3 - 2 * x)
    if t <= DESVIO_DE or t >= DESVIO_ATE:
        return 0
    if t <= DESVIO_PICO_EM:
        return -round(DESVIO * suave_((t - DESVIO_DE) / (DESVIO_PICO_EM - DESVIO_DE)))
    return -round(DESVIO * (1 - suave_((t - DESVIO_PICO_EM) / (DESVIO_ATE - DESVIO_PICO_EM))))


def fase_estampa(a: int, b: int) -> float:
    """Quanto a estampa andou (px em 1080, no sentido do giro) do quadro a para o b: correlação de fase
    numa faixa horizontal das costas."""
    y0, y1 = FAIXA_ESTAMPA
    def faixa(n):
        g = cv2.resize(cv2.cvtColor(quadro(n), cv2.COLOR_RGB2GRAY), (1080, 1080), interpolation=cv2.INTER_AREA)
        f = g[y0:y1].astype(np.float32)
        f -= f.mean()
        return f * np.hanning(f.shape[1])[None, :] * np.hanning(f.shape[0])[:, None]
    R = np.fft.fft2(faixa(a)).conj() * np.fft.fft2(faixa(b))
    R /= np.abs(R) + 1e-6
    c = np.fft.ifft2(R).real
    py, px = np.unravel_index(np.argmax(c), c.shape)
    w = c.shape[1]
    l, m, r = c[py, (px - 1) % w], c[py, px], c[py, (px + 1) % w]
    dx = px + (0.5 * (l - r) / (l - 2 * m + r) if (l - 2 * m + r) else 0)
    dx = dx - w if dx > w / 2 else dx
    return -dx  # a estampa anda para a esquerda no sentido do giro


def roteiro(u: list[int]) -> tuple[list[tuple], int, int]:
    """A volta como receitas: ("q", n) = quadro original, ("f", a, b, w[, protege]) = fundido.
    Devolve também quantas receitas iniciais (retomada) e finais (emenda) não podem repetir."""
    s = [n for n in u if n >= ENTRADA]
    janela = [n for n in s if n <= RETOMA_ATE]
    passos = [max(0.0, fase_estampa(a, b)) for a, b in zip(janela, janela[1:])]
    fase = np.concatenate([[0.0], np.cumsum(passos)])
    retomada = []
    k = 0
    while k * VEL < fase[-1] - VEL * 0.5:
        p = float(np.interp(k * VEL, fase, np.arange(len(janela))))
        i, t = int(p), p - int(p)
        if t < 0.06 or i + 1 >= len(janela):
            retomada.append(("q", janela[i]))
        elif t > 0.94:
            retomada.append(("q", janela[i + 1]))
        else:
            retomada.append(("f", janela[i], janela[i + 1], round(t, 3)))
        k += 1
    print("retomada: passos da estampa no vídeo", " ".join(f"{x:.1f}" for x in passos))
    fim = PARES[0][0]
    meio = [("q", n) for n in s if janela[-1] <= n < fim]
    emenda = [("f", e, j, w, True) for e, j, w in PARES]
    for e, _, _ in PARES:
        assert e in u, f"o quadro {e} da emenda é repetido"
    return retomada + meio + emenda, len(retomada), len(emenda)


def main() -> None:
    global PASTA, FUNDO
    video = Path(sys.argv[1])
    PASTA = Path(tempfile.mkdtemp(prefix="giro-"))
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(video), "-fps_mode", "passthrough", "-start_number", "0", str(PASTA / "q%03d.png")],
        check=True,
    )
    total = len(list(PASTA.glob("q*.png")))
    u = unicos(total)
    plano, n_retomada, n_emenda = roteiro(u)

    # Os repetidos que sobram (POR_VOLTA − receitas) vão para o miolo, espaçados por igual.
    sobra = POR_VOLTA - len(plano)
    assert sobra >= 0, f"a volta tem {len(plano)} quadros, mais que {POR_VOLTA}"
    miolo = list(range(n_retomada, len(plano) - n_emenda))
    repete = {miolo[int((k + 0.5) * len(miolo) / sobra)] for k in range(sobra)}
    assert len(repete) == sobra
    volta = [r for i, r in enumerate(plano) for _ in range(2 if i in repete else 1)]
    fundidos = sum(r[0] == "f" for r in plano)
    print(f"{total} quadros, {total - len(u)} repetidos, {len(u)} únicos; volta: {len(plano)} quadros "
          f"({fundidos} fundidos por fluxo) + {sobra} repetidos = {len(volta)}")

    # Só o conteúdo: no Windows a pasta costuma estar presa pelo Explorer ou pelo estúdio.
    SAIDA.mkdir(parents=True, exist_ok=True)
    for velho in SAIDA.glob("*.jpg"):
        velho.unlink()
    rng = np.random.default_rng(1)
    FUNDO = apaga_selo(fundo_limpo(total), rng)
    anterior, img = None, None
    for i, r in enumerate(volta):
        if r != anterior:
            base = quadro(r[1]).astype(np.float32) if r[0] == "q" else funde(*r[1:])
            img = apaga_selo(base, rng)
            anterior = r
        out = np.clip(desloca(img, desvio(i, len(volta)), rng), 0, 255).astype(np.uint8)
        Image.fromarray(out).save(SAIDA / f"{i:03d}.jpg", quality=97, subsampling=0)
    shutil.rmtree(PASTA)
    print(f"{len(volta)} quadros em {SAIDA} ({img.shape[1]}×{img.shape[0]})")


if __name__ == "__main__":
    main()
