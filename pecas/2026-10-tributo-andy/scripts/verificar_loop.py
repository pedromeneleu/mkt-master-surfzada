"""Verifica o loop da capa: duração, emenda fim → começo, voltas idênticas e cadência."""
import json
import subprocess
import sys

import numpy as np

sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows (cp1252) não imprime → nem acentos

video = sys.argv[1]
volta = int(sys.argv[2]) if len(sys.argv) > 2 else 225

info = json.loads(subprocess.run(
    ["ffprobe", "-v", "error", "-count_frames", "-show_entries",
     "stream=width,height,r_frame_rate,nb_read_frames,codec_name,pix_fmt:format=duration,bit_rate", "-of", "json", video],
    capture_output=True, text=True, check=True).stdout)
s = info["streams"][0]
print(f"vídeo: {s['codec_name']} {s['width']}x{s['height']} {s['pix_fmt']} {s['r_frame_rate']} fps, "
      f"{s['nb_read_frames']} quadros, {float(info['format']['duration']):.3f} s, {int(info['format']['bit_rate'])/1e6:.1f} Mbps")

L = 360
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={L}:{L},format=gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, L, L).astype(np.float32)
n = len(F)
passo = np.array([np.abs(F[(i + 1) % n] - F[i]).mean() for i in range(n)])  # passo[n-1] = último → primeiro
mov = passo[passo > 1.0]
print(f"passos com movimento: mediana {np.median(mov):.2f}, mín {mov.min():.2f}, máx {mov.max():.2f}")
print(f"emenda do Instagram (último → primeiro): {passo[-1]:.2f}")
for k in range(1, n // volta):
    print(f"emenda da volta {k} (quadro {k*volta-1} → {k*volta}): {passo[k*volta-1]:.2f}")
iguais = [np.abs(F[i] - F[i + volta]).mean() for i in range(n - volta)]
print(f"volta k vs volta k+1 (mesmo quadro): diferença média {np.mean(iguais):.3f}, máx {np.max(iguais):.3f}")
rep = np.where(passo < 1.0)[0]
print(f"quadros repetidos: {len(rep)} em {n} ({len(rep)/(n/volta):.0f} por volta); intervalos: {sorted(set(np.diff(rep).tolist()))}")
saltos = np.where(passo > 2.2 * np.median(mov))[0]
print(f"saltos (> 2,2× a mediana): {saltos.tolist()}")
