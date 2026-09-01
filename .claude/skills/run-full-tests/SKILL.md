---
name: run-full-tests
description: Use quando o usuário pedir para rodar todos os testes do projeto (ex. "roda os testes", "confirma que tudo passa", "testa tudo antes de eu commitar/dar push"), sem especificar apenas backend ou apenas frontend.
---

# Run Full Tests

Roda os testes de backend e frontend em sequência e resume o resultado.

## Passo a passo

1. **Backend**: `cd backend && ./gradlew test`
2. **Frontend**: `cd frontend && npx ng test --watch=false`
3. Rode os dois mesmo se só um lado tiver sido alterado, a menos que o usuário peça explicitamente para testar só uma parte — assim fica claro se algo quebrou do outro lado sem querer.
4. Resuma ao final: quantos testes passaram/falharam em cada lado. Se algo falhou, mostre o(s) teste(s) que falharam e a mensagem de erro relevante — não só "falhou".

## Regras importantes

- Não marque a tarefa como concluída/pronta para commit se algum dos dois suites falhar.
- Não rode com `--watch` (fica preso esperando input); sempre `--watch=false` no frontend.
