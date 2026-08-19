# funcionarios-web

Frontend Angular para o CRUD de funcionários, consumindo a API `funcionarios-api`. Segue o mesmo padrão standalone + Angular Material usado em `core-plataforma-cursos`.

## Stack

- Angular 22 (standalone components, signals, control flow `@if`/`@for`)
- Angular Material + CDK
- RxJS + `HttpClient`
- Vitest (via `@angular/build:unit-test`)

## Arquitetura

Aplicação single-page sem roteamento (uma única tela de CRUD), organizada por feature:

```
src/app/
├── app.ts / app.html / app.scss      Componente raiz: orquestra estado (signals) e chama o service
├── employee.model.ts                  Interfaces Employee / EmployeePayload
├── employees.service.ts               Client HTTP (GET/POST/PUT/DELETE) para /api/employees
├── employee-form/                     Formulário reativo de criação/edição (dumb component)
└── employee-list/                     Tabela (mat-table) de listagem/edição/remoção (dumb component)
```

- **`App`** é o único *smart component*: mantém o estado (`employees`, `loading`, `saving`, `editingEmployeeId`) como signals, chama `EmployeesService` e trata sucesso/erro com `MatSnackBar`.
- **`EmployeeForm`** e **`EmployeeList`** são componentes de apresentação: recebem dados via `input()` e comunicam intenção via `output()` (`save`, `cancel`, `edit`, `remove`), sem conhecer o service.
- **`EmployeesService`** isola a comunicação HTTP e normaliza erros do backend em `Error` com mensagem amigável.

## Telas / funcionalidades

- Listagem de funcionários em tabela (nome, e-mail, cargo, salário, data de admissão).
- Criação de funcionário via formulário com validação (nome, e-mail, cargo, salário e data obrigatórios).
- Edição: ao clicar em "Editar" na tabela, o formulário é preenchido e passa a atualizar o registro.
- Remoção com confirmação (`window.confirm`).
- Feedback de sucesso/erro via snackbar; estado de carregamento com spinner.

## Rodando localmente

Backend (`funcionarios-api`) deve estar rodando em `http://localhost:8080` (CORS já liberado para `http://localhost:4200`).

```bash
npm install
npm start
```

Acesse `http://localhost:4200`.

## Testes

```bash
npm test
```

Cobre: `EmployeesService` (mock de HTTP), `EmployeeForm` (validação e emissão de payload normalizado), `EmployeeList` (renderização de linhas e eventos de ação) e `App` (bootstrap do componente raiz).

## Subindo com Docker (integrado com o backend)

O build de produção (`environment.ts`) usa `apiUrl: '/api'` (relativo), servido por nginx (`nginx.conf`) que faz proxy de `/api/*` para o serviço `backend` do `docker-compose.yml` na raiz do monorepo:

```bash
cd ..
docker compose up -d --build
```

Acesse `http://localhost:4200`. Para derrubar: `docker compose down` (a partir da raiz do repositório).
