---
name: docker-smoke-check
description: Use quando o usuário pedir para testar a aplicação rodando via Docker, verificar se a tela/API sobem corretamente, ou confirmar visualmente uma mudança (ex. "sobe o docker e testa", "confirma que a tela tá funcionando", "faz um smoke test").
---

# Docker Smoke Check

Sobe o `docker-compose.yml` do projeto e confirma que backend e frontend respondem antes de dar a mudança como validada visualmente.

## Passo a passo

1. **Ver se já está rodando**: `docker compose ps`. Se `backend` e `frontend` já estiverem `up`, não precisa subir de novo — pule para o passo 3, a menos que o código tenha mudado (aí precisa rebuild).

2. **Subir (ou rebuildar)**: `docker compose up -d --build`
   - Use `--build` sempre que houver mudança de código desde o último `up`, para não testar uma imagem desatualizada.

3. **Checar backend**: `curl -s http://localhost:8080/api/employees` (ou equivalente) e confirmar resposta JSON válida (200), não erro de conexão.

4. **Checar frontend**: `curl -sI http://localhost:4200` e confirmar `200 OK`. Se o usuário quiser validação visual real (não só HTTP), diga explicitamente que abrir o navegador é necessário para isso — não afirme que a tela "funciona" apenas com base no curl.

5. **Reportar**: resuma o que respondeu e o que não. Se algo não subiu, mostre `docker compose logs <serviço>` do serviço com problema.

6. **Derrubar (opcional)**: só rode `docker compose down` se o usuário pedir — deixar rodando é o padrão neste projeto entre sessões.

## Regras importantes

- Nunca afirme "a tela está funcionando visualmente" com base só em `curl`/status HTTP — isso só confirma que o servidor respondeu, não que a UI renderiza corretamente.
- Se `docker compose up` falhar, não tente contornar com `--force-recreate` ou apagar volumes sem entender a causa raiz primeiro.
