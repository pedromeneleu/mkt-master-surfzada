@AGENTS.md

## Só para o Claude Code

Skills deste repositório (em `.claude/skills/`, chamadas por `/nome`):

- `/novo-post` — cria uma peça (pergunta modelo, nome e briefing) e preenche o post.md.
- `/renderizar` — traz os assets, renderiza e mostra os quadros para revisão.
- `/revisar` — confere uma peça contra o checklist do MR (docs/06-revisao-e-git.md).
- `/entregar` — entrega no Drive e atualiza o status.

Elas só chamam a CLI descrita no AGENTS.md; o Codex segue as mesmas receitas de lá.

Ao revisar visualmente, renderize quadros (`npm run quadros`) e leia os PNGs com a ferramenta de
leitura de imagem antes de concluir.
