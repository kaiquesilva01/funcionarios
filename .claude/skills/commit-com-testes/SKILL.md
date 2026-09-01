---
name: commit-com-testes
description: Testa e commita todas as modificações pendentes do repositório, seguindo o padrão de commit do projeto. Use quando o usuário pedir para "commitar", "salvar as alterações", "fazer commit do que foi feito" ou algo equivalente.
---

# Commit com testes

Faz commit de todas as modificações pendentes, mas **nunca antes de rodar os testes relevantes ao que foi alterado**. Se os testes falharem, o commit não deve ser feito.

## Passo a passo

1. **Levantar o que mudou**
   - Rode `git status` e `git diff` (staged e unstaged) para ver todos os arquivos alterados, criados ou removidos.
   - Identifique se as mudanças tocam `backend/`, `frontend/`, ou ambos.

2. **Rodar os testes correspondentes ANTES de qualquer commit**
   - Se houve alteração em `backend/`: rode os testes do backend com `cd backend && ./mvnw test` (Maven — o projeto usa `pom.xml`/`mvnw`, não Gradle).
   - Se houve alteração em `frontend/`: rode os testes do frontend (ex.: `cd frontend && npx ng test --watch=false` ou `npm test`, conforme o `package.json`).
   - Se a alteração for só em documentação/config sem código testável (ex.: `.md`, `docker-compose.yml`), pode pular a etapa de teste automatizado, mas diga isso explicitamente ao usuário antes de commitar.
   - **Se algum teste falhar**: pare, reporte a falha ao usuário e não prossiga para o commit até que esteja tudo passando (a menos que o usuário peça explicitamente para commitar mesmo assim).

3. **Revisar o que será staged**
   - Rode `git status` novamente e confira se não há arquivos sensíveis (`.env`, credenciais, chaves) sendo incluídos.
   - Adicione os arquivos específicos por nome (evite `git add -A`/`git add .` cegos quando houver arquivos não relacionados à mudança).

4. **Commitar seguindo o padrão do projeto**
   - Mensagens no formato Conventional Commits, em português, olhando o histórico (`git log --oneline`) para manter consistência:
     - `feat(escopo): descrição` — nova funcionalidade
     - `fix(escopo): descrição` — correção de bug
     - `chore(escopo): descrição` — manutenção, build, config
     - `refactor(escopo): descrição` — refatoração sem mudança de comportamento
     - `test(escopo): descrição` — apenas testes
     - `docs(escopo): descrição` — apenas documentação
   - `escopo` costuma ser `frontend`, `backend`, ou omitido quando a mudança é geral.
   - Corpo da mensagem é opcional; use quando o "porquê" não for óbvio.
   - Sempre use heredoc para a mensagem de commit, para preservar formatação.
   - Adicione a assinatura:
     ```
     Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
     ```

5. **Confirmar o resultado**
   - Rode `git status` após o commit para confirmar que foi criado com sucesso e não sobrou nada inesperado.

## Regras importantes

- Nunca pule os testes para "economizar tempo" — essa é a razão de existir desta skill.
- Nunca use `--no-verify` para pular hooks.
- Nunca faça `git push` automaticamente após o commit, a menos que o usuário peça.
- Se não houver nenhuma alteração pendente, informe o usuário e não crie commit vazio.
- Se o usuário só pediu para commitar uma parte específica (ex.: só o frontend), rode apenas os testes daquela parte, mas confirme com o usuário se há outras mudanças pendentes ficando de fora do commit.
