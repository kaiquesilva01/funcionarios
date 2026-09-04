# Contexto do projeto: funcionarios

> Gerado para retomar o trabalho em uma nova janela de contexto. Este arquivo é lido automaticamente pelo Claude Code ao abrir este diretório.

## O que é

Monorepo com um CRUD de funcionários: API Spring Boot (arquitetura hexagonal) + SPA Angular (Material). Construído do zero nesta sessão, seguindo os padrões dos outros projetos da pasta `Projetos` (`srv-saldo` para o backend, `core-plataforma-cursos` para o frontend).

```
funcionarios/
├── backend/            API REST (Spring Boot 4.1.0, Java 21, H2 em memória)
├── frontend/           SPA Angular 22 standalone + Material
├── docker-compose.yml  Sobe os dois serviços integrados
├── README.md           Visão geral + como rodar
└── PR_DESCRIPTION.md   Descrição usada no PR #1
```

## Estado atual no GitHub

- Repo: **https://github.com/kaiquesilva01/funcionarios** (público)
- `main` é a branch estável — todo o trabalho até aqui (CRUD, migração Maven, dialogs de confirmação, identidade visual "Registro", filtro/paginação/busca/ordenação, agents) já está mergeado nela.
- `develop` existe a partir de `main` e é a base para novas features.

### Estratégia de branches

- **`main`**: estável, sempre com o que já foi revisado e testado. Nunca commitar direto nela.
- **`develop`**: ponto de partida para novas features. Crie a branch da feature a partir de `develop` (`git checkout develop && git checkout -b feat/xxx`).
- Feature branches abrem PR contra `main` (o fluxo dos agents — `feature-delivery`/`pr-implementer` — já faz isso). Depois de mergear em `main`, sincronize `develop` com `main` (`git checkout develop && git merge main && git push`) antes de começar a próxima feature.
- Cuidado com **PRs encadeados** (uma branch de feature aberta em cima de outra branch de feature, não de `main`/`develop`): isso já aconteceu neste projeto (PRs #2 e #3 foram mergeados em branches intermediárias e nunca chegaram a `main` até serem resgatados pelo PR #4) e é fácil de não perceber olhando só o `gh pr list`. Sempre confira `baseRefName` do PR (`gh pr view <n> --json baseRefName`) antes de assumir que "MERGED" significa "está em main".

### Observação sobre repositório extra

Nesta sessão eu cheguei a criar por engano um repositório separado `funcionarios-web` antes de consolidar tudo neste monorepo. Ele já foi **apagado** do GitHub (confirmado). O único repo relevante é `funcionarios`.

### Autenticação GitHub nesta máquina

- `gh` CLI está instalado (`C:\Program Files\GitHub CLI`) e autenticado como `kaiquesilva01`, com escopos `repo, delete_repo, gist, read:org`.
- Também existe um token OAuth em cache no Git Credential Manager do Windows (usado para o `git push` funcionar sem prompt). Não imprimir/logar esse token em texto puro se precisar reusá-lo — extraia com `git credential fill` dentro do próprio comando que o consome.

## Arquitetura

### Backend (`backend/`)

Hexagonal, por feature (`employee`):

```
employee/
├── domain/      Employee (record), exceções de negócio — zero dependência de Spring
├── port/        input (use cases) e output (EmployeeRepository) — interfaces
├── application/ EmployeeService — implementa os use cases
└── adapter/
    ├── input/web/   EmployeeController, DTOs, GlobalExceptionHandler
    └── output/jpa/  EmployeeEntity, SpringDataEmployeeRepository, JpaEmployeeRepositoryAdapter
```

Regra de dependência validada por `HexagonalArchitectureTest` (ArchUnit): `adapter -> application -> port -> domain`.

Endpoints: `GET|POST /api/employees`, `GET|PUT|DELETE /api/employees/{id}`. Validações: e-mail único (409), salário >= 0, data de admissão não pode estar no futuro, 404 para id inexistente. CORS liberado para `http://localhost:4200` (uso local sem Docker).

25 testes (`./gradlew test`): `EmployeeServiceTest` (Mockito), `EmployeeControllerTest` (`@WebMvcTest`), `JpaEmployeeRepositoryAdapterTest` (`@DataJpaTest`), `HexagonalArchitectureTest`, `ApplicationTests`.

### Frontend (`frontend/`)

Standalone components + signals, sem roteamento (tela única):

```
app/
├── app.ts/html/scss     Smart component: estado (signals) + orquestração
├── employee.model.ts    Employee / EmployeePayload
├── employees.service.ts Client HTTP (/api/employees)
├── employee-form/       Formulário reativo (dumb component)
└── employee-list/       Tabela mat-table (dumb component)
```

12 testes Vitest (`npm test`): service (mock HTTP), form (validação/normalização de payload), list (render/eventos), app (bootstrap).

Em build de produção, `environment.ts` usa `apiUrl: '/api'` (relativo) — o nginx do container (`nginx.conf`) faz `proxy_pass` para o serviço `backend`. Em dev (`environment.development.ts`) usa `http://localhost:8080/api` direto.

## Como rodar

**Docker (recomendado para testar a tela):**
```bash
cd C:\Users\Kaique\Desktop\Kaique\Projetos\funcionarios
docker compose up -d --build
# frontend: http://localhost:4200
# backend:  http://localhost:8080/api/employees (console H2 em /h2-console)
docker compose down   # para derrubar
```

**Sem Docker:**
```bash
cd backend && ./mvnw spring-boot:run   # sobe em :8080 (Maven, não Gradle — ver seção de armadilhas)
cd frontend && npm install && npm start   # sobe em :4200
```

## Decisões e armadilhas descobertas nesta sessão (não repetir a investigação)

- **Java 25 é o único JDK instalado**, mas o projeto pede toolchain 21. Só funciona graças ao plugin `org.gradle.toolchains.foojay-resolver-convention` em `settings.gradle`, que baixa o JDK 21 automaticamente. Não remover.
- **Spring Boot 4.1 quebrou pacotes de teste que mudaram de lugar** em relação a versões anteriores:
  - `@WebMvcTest` → `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest` (não é mais `org.springframework.boot.test.autoconfigure.web.servlet`)
  - `@MockBean` foi removido/descontinuado → usar `@MockitoBean` (`org.springframework.test.context.bean.override.mockito.MockitoBean`)
  - `@DataJpaTest` → `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, e precisa da dependência extra `testImplementation 'org.springframework.boot:spring-boot-data-jpa-test'` (não vem em `spring-boot-starter-webmvc-test`)
- **`ng add @angular/material` quebrou** neste ambiente (erro "Cannot read properties of undefined (reading 'primary')") ao tentar configurar o tema automaticamente. Contornado instalando `@angular/animations` manualmente e não usando nenhum tema Material explícito no `styles.scss` — mesmo padrão observado em `core-plataforma-cursos`, que também não define tema e funciona.
- **Erros 400 ao testar PUT com acento (ex. "Sênior") via `curl -d` no Git Bash do Windows** são artefato de encoding do terminal, não bug da API — confirmado repetindo o mesmo payload em ASCII puro (sucesso). Não gastar tempo "corrigindo" a API se isso aparecer de novo em teste manual via bash.
- **Token do Git Credential Manager (usado para `git push`) não tinha escopo `delete_repo`** — foi preciso instalar o `gh` CLI via `winget install --id GitHub.cli` e autenticar via device flow (`gh auth login --scopes "repo,delete_repo" --web`) para apagar o repo `funcionarios-web` criado por engano.
- **Budget de bundle do Angular** ajustado para `700kB`/`1MB` (igual ao `core-plataforma-cursos`) porque o padrão do CLI (`500kB`) estoura com Material incluído.

## Squad de agents

Este projeto tem um pipeline de agents em `.claude/agents/` para entregar features de ponta a ponta:

`product-owner` (refinamento de negócio) → `tech-lead` (refinamento técnico) → `ux-ui-designer` (refinamento de UX/UI, só quando há impacto visual) → `pr-implementer` (implementa, testa, commita, abre PR, mergeia) → `qa` (valida critérios de aceite).

Use o agent `feature-delivery` como ponto de entrada único para rodar esse ciclo completo a partir de um pedido em texto livre — ele faz uma etapa de esclarecimento com o usuário antes de acionar o `product-owner`, se houver ambiguidade real.

## Próximos passos

1. Novas features nascem de `develop` (branch da feature a partir dela, não de `main` direto).
2. Rodar os testes antes de commitar: `cd backend && ./mvnw test` e `cd frontend && npx ng test --watch=false`.
3. Se fizer sentido testar visualmente, usar o fluxo Docker acima.
4. Depois do PR mergeado em `main`, sincronizar `develop` com `main`.
