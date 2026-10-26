"""Extrai o esqueleto (pose) do surfista de cada clipe e grava pose.json na pasta da peça.

O esqueleto que aparece no vídeo é o de verdade: um modelo de pose (YOLO11l-pose, 17 pontos
COCO) roda quadro a quadro nos clipes convertidos por `npm run assets`. Não é desenhado à mão.

Cada clipe pode ter mais gente na água; o surfista que interessa é escolhido pelo ponto
SEMENTE (x, y em 0–1 no primeiro quadro) e seguido quadro a quadro pela caixa mais próxima.
O modelo roda num recorte quadrado em volta de onde o surfista estava (4× a altura dele): na
CPU é ~4× mais rápido que o quadro inteiro e acha melhor quem está pequeno lá no fundo.
Quadro sem detecção confiável repete a pose anterior (marcado com "f": 0), e o caminho do
quadril é suavizado para a câmera virtual não tremer.

Saída (pose.json, ~200 KB): por clipe, fps do clipe e, por quadro, a caixa e os 17 pontos em
coordenadas 0–1 do quadro 1920×1080, com a confiança: [x, y, c].

Uso (o ultralytics puxa o PyTorch, ~1 GB, por isso não está no requirements.txt):
    py -m venv .venv-pose && .venv-pose/Scripts/pip install ultralytics
    npm run assets -- ia-analisa-rasgada
    .venv-pose/Scripts/python pecas/2026-10-ia-analisa-rasgada/scripts/extrair_pose.py
"""

import json
import sys
from pathlib import Path

import cv2
from ultralytics import YOLO

SLUG = "2026-10-ia-analisa-rasgada"
RAIZ = Path(__file__).resolve().parents[3]
CLIPES = RAIZ / "public" / "pecas" / SLUG / "clipes"
SAIDA = RAIZ / "pecas" / SLUG / "pose.json"

# Onde está o surfista no primeiro quadro de cada clipe (medido nos quadros de revisão).
SEMENTE = {
    "rasgada": (0.56, 0.35),
    "vaca": (0.51, 0.47),
    "espuma": (0.68, 0.57),
}
# Abaixo disso o ponto é desenhado apagado (ou não é desenhado).
CONF_MINIMA = 0.25


def centro(caixa):
    x1, y1, x2, y2 = caixa
    return (x1 + x2) / 2, (y1 + y2) / 2


def detectar(modelo, img, alvo, altura):
    """Roda a pose num recorte em volta do alvo e devolve caixas e pontos em 0–1 do quadro."""
    h, w = img.shape[:2]
    lado = int(min(h, max(420, 4 * (altura or 0.25) * h)))
    x0 = int(min(max(alvo[0] * w - lado / 2, 0), w - lado))
    y0 = int(min(max(alvo[1] * h - lado / 2, 0), h - lado))
    r = modelo.predict(img[y0 : y0 + lado, x0 : x0 + lado], imgsz=640, conf=0.15, verbose=False)[0]
    if r.boxes is None or not len(r.boxes):
        return []
    volta_x = lambda v: (x0 + v * lado) / w
    volta_y = lambda v: (y0 + v * lado) / h
    saida = []
    for caixa, pontos, conf in zip(r.boxes.xyxyn.tolist(), r.keypoints.xyn.tolist(), r.keypoints.conf.tolist()):
        saida.append(
            (
                [volta_x(caixa[0]), volta_y(caixa[1]), volta_x(caixa[2]), volta_y(caixa[3])],
                [(volta_x(x), volta_y(y)) for x, y in pontos],
                conf,
            )
        )
    return saida


def extrair(modelo, nome, semente):
    cap = cv2.VideoCapture(str(CLIPES / f"{nome}.mp4"))
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    alvo = semente
    altura = None
    quadros = []
    while True:
        ok, img = cap.read()
        if not ok:
            break
        if len(quadros) % 25 == 0:
            print(f"  {nome}: {len(quadros)}/{total}", flush=True)
        achadas = detectar(modelo, img, alvo, altura)
        melhor = None
        if achadas:
            caixas = [a[0] for a in achadas]
            # A caixa mais perto de onde o surfista estava (e de altura parecida).
            for i, caixa in enumerate(caixas):
                cx, cy = centro(caixa)
                dist = ((cx - alvo[0]) ** 2 + (cy - alvo[1]) ** 2) ** 0.5
                if altura:
                    dist += abs((caixa[3] - caixa[1]) - altura) * 0.5
                if dist < 0.12 and (melhor is None or dist < melhor[0]):
                    melhor = (dist, i)
        if melhor is None:
            anterior = quadros[-1] if quadros else None
            quadros.append({**anterior, "f": 0} if anterior else None)
            continue
        caixa, pontos, conf = achadas[melhor[1]]
        alvo = centro(caixa)
        altura = caixa[3] - caixa[1]
        quadros.append(
            {
                "f": 1,
                "caixa": [round(v, 4) for v in caixa],
                "p": [[round(x, 4), round(y, 4), round(c, 2)] for (x, y), c in zip(pontos, conf)],
            }
        )
    cap.release()
    # Quadros do começo sem detecção: copiam o primeiro detectado.
    primeiro = next((q for q in quadros if q), None)
    if primeiro is None:
        sys.exit(f"{nome}: nenhum surfista achado perto de {semente}")
    quadros = [q or {**primeiro, "f": 0} for q in quadros]
    achados = sum(q["f"] for q in quadros)
    print(f"  {nome}: {len(quadros)} quadros a {fps:g} fps, surfista em {achados} ({w:g}×{h:g})")
    return {"fps": fps, "quadros": quadros}


def main():
    modelo = YOLO("yolo11l-pose.pt")
    pose = {nome: extrair(modelo, nome, s) for nome, s in SEMENTE.items()}
    SAIDA.write_text(json.dumps(pose, separators=(",", ":")), encoding="utf-8")
    print(f"  {SAIDA.relative_to(RAIZ)} ({SAIDA.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
