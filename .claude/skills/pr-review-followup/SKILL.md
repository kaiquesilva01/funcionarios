---
name: pr-review-followup
description: Use quando o usuário pedir para aplicar os apontamentos/comentários de revisão de um PR (ex. "aplica os comentários do PR", "resolve o que pediram na review", "atende o feedback do PR #1"), ou quando disser algo como "trouxe apontamentos do PR" sem detalhar o passo a passo.
---

# PR Review Followup

Aplica os apontamentos de revisão de um PR do GitHub de ponta a ponta: lê os comentários, corrige, testa e sobe as mudanças.

## Passo a passo

1. **Descobrir o PR**
   - Se o usuário não disser o número, use o PR aberto atual (`gh pr view --json number,url` na branch corrente, ou `gh pr list`).

2. **Ler os comentários**
   - `gh pr view <numero> --comments` para comentários gerais.
   - `gh api repos/{owner}/{repo}/pulls/<numero>/comments` para comentários inline (por arquivo/linha) — geralmente mais específicos e fáceis de perder.
   - Liste cada apontamento como um item de tarefa (todo), com arquivo/linha quando houver.

3. **Aplicar cada apontamento**
   - Trate como mudanças de código normais: leia o arquivo antes de editar, siga a arquitetura hexagonal do backend e os padrões standalone/signals do frontend já estabelecidos no projeto.
   - Se um apontamento for ambíguo ou parecer tecnicamente questionável, pergunte ao usuário antes de implementar — não aplique cegamente.

4. **Testar antes de commitar**
   - Rode os testes das partes tocadas (`cd backend && ./gradlew test`, `cd frontend && npx ng test --watch=false`). Não pule esta etapa mesmo para mudanças pequenas.

5. **Commitar e subir**
   - Um commit por apontamento relacionado (ou agrupados coerentemente), mensagens em Conventional Commits/português seguindo `git log --oneline` do projeto.
   - `git push` (branch já tem upstream configurado neste projeto).

6. **Responder no PR (opcional)**
   - Se fizer sentido, comente no PR ou nos threads inline resolvendo/explicando o que foi feito (`gh pr comment` ou `gh api .../comments/<id>/replies`). Só faça isso se o usuário pedir ou confirmar.

## Regras importantes

- Nunca pule os testes para ganhar tempo.
- Nunca force-push sem confirmação explícita do usuário.
- Se um comentário de review não fizer sentido tecnicamente, questione antes de implementar (não é obrigação aplicar tudo ao pé da letra).
