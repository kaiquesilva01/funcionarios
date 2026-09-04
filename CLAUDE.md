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
- PR aberto: **https://github.com/kaiquesilva01/funcionarios/pull/1** — `feat/employee-crud` → `main`
- `main` só tem o commit `chore: initial commit` (base vazia, de propósito, para o PR mostrar o diff completo)
- `feat/employee-crud` tem 3 commits de feature: backend, frontend, docker/docs (ver `git log --oneline feat/employee-crud`)
- **Próximo passo esperado**: o usuário vai revisar o PR #1 (ou pedir revisão) e trazer apontamentos de melhoria para o site. Para ver comentários do PR: `gh pr view 1 --comments` ou `gh api repos/kaiquesilva01/funcionarios/pulls/1/comments` (revisões inline).

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
cd backend && ./gradlew bootRun     # sobe em :8080
cd frontend && npm install && npm start   # sobe em :4200
```

Ao fim desta sessão os containers estavam **rodando** (`docker compose ps` mostrava `backend` e `frontend` up). Rode `docker compose ps` no início da próxima sessão para conferir o estado antes de assumir que precisa subir de novo.

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

## Próximos passos

O usuário vai trazer **apontamentos de revisão do PR #1** para melhorar a tela (frontend) e possivelmente o backend. Ao retomar:

1. Ler os comentários do PR (`gh pr view 1 --comments` ou pela UI do GitHub).
2. Fazer as alterações pedidas em `feat/employee-crud` (branch já existe local e remotamente).
3. Rodar os testes de novo antes de commitar: `cd backend && ./gradlew test` e `cd frontend && npx ng test --watch=false`.
4. Se fizer sentido testar visualmente, usar o fluxo Docker acima.
5. Commitar e dar `git push` (branch já tem upstream configurado — basta `git push`).
