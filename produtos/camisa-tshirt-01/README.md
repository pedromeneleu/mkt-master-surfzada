# Camisa TSHIRT-01

Camisa preta da Surfzada, arte aprovada pelo João em 2026-09-30.

- **Costas:** sol nascente + retícula da foto de Saquarema + "Don't Waste Your Time" em gótico +
  4 quadros em gravura + rodapé "ACERVO SURFZADA.COM.BR". Inspirada no Rising Sun (Billabong /
  Andy Irons): ver a peça `pecas/2026-10-tributo-andy`.
- **Frente:** logo no peito.

## O que fica onde

| Onde | O quê |
|---|---|
| git (esta pasta) | geradores Python/JS, `saquarema.jpg` (foto da retícula), este README e `creditos.md` |
| Drive `produtos/camisa-tshirt-01/` | `TSHIRT-01.af` (Affinity, arte final), `tshirt-01.blend` (animação), `export/` (PNGs finais das costas e da frente), `texturas/`, `modelos/zakaria/` (modelo 3D do Sketchfab) |

## Gerar a arte das costas

Dependências: `requirements.txt` da raiz + `fonttools` e `shapely` (`pip install fonttools shapely`)
e a fonte Old English (`oldengl.ttf`), que vem com o Windows.

```bash
py produtos/camisa-tshirt-01/gen_back.py                # → out/produtos/camisa-tshirt-01/back.json (vetores, 30×40 cm a 300 dpi)
py produtos/camisa-tshirt-01/preview_layers.py 0 0 3543 4724 0.25 out/produtos/camisa-tshirt-01/preview.png
py produtos/camisa-tshirt-01/letreiro.py "DON'T WASTE YOUR TIME" out/produtos/camisa-tshirt-01/letreiro.png
```

Para desenhar no Affinity: copie o `back.json` para `Área de Trabalho/surfzada_tshirt/` (é a pasta
que o Affinity enxerga) e rode `build_affinity.js` pelo MCP do Affinity, com o `TSHIRT-01.af`
aberto. Ele substitui o grupo "ARTE COSTAS" da prancheta "COSTAS".

## Animação "ghost" (parada)

A camisa "andando" sem corpo, com a câmera girando, em `tshirt-01.blend` (Drive). Usa o modelo
"Camisa Zakaria" (ver `creditos.md`), com um rig próprio ("Rig Camisa") e um ciclo de caminhada
de 32 frames (render 31–270). Parou no teste da simulação de pano por cima do rig (grupo "pin",
cache 1–100 assado). Faltam: validar o pano, aplicar as estampas nas UVs "uv", material preto,
luz, fundo, câmera em órbita e render final.

Dica do Blender pelo MCP: o screenshot do viewport vem preto (confira por render Workbench) e
renders longos estouram o timeout.
