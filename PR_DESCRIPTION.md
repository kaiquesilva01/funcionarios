# feat: CRUD de funcionários (backend + frontend)

## Resumo

- Adiciona o backend `backend/` (Spring Boot 4.1.0, Java 21) com CRUD completo de funcionários, arquitetura hexagonal (domain → port → application → adapter, igual ao `srv-saldo`), persistência em H2 via Spring Data JPA.
- Adiciona o frontend `frontend/` (Angular 22 standalone + Material) com telas de listagem, criação, edição e remoção de funcionários, consumindo a API acima.
- Adiciona `docker-compose.yml` na raiz para subir os dois serviços integrados (nginx do frontend faz proxy de `/api/*` para o backend, sem CORS).

## Backend (`backend/`)

Endpoints em `/api/employees`: `GET`, `GET/{id}`, `POST`, `PUT/{id}`, `DELETE/{id}`. Regras: e-mail único (409 se duplicado), salário >= 0, data de admissão não pode estar no futuro, 404 para id inexistente.

Testes (`./gradlew test`, 25 testes): unitários de serviço (Mockito), fatia web (`@WebMvcTest`), persistência (`@DataJpaTest`) e regras de arquitetura (ArchUnit).

## Frontend (`frontend/`)

Um smart component (`App`, estado em signals) orquestra dois componentes de apresentação: `EmployeeForm` (formulário reativo com validação) e `EmployeeList` (tabela com ações de editar/remover). `EmployeesService` isola as chamadas HTTP.

Testes (`npm test`, 12 testes): service (mock de HTTP), formulário (validação e normalização de payload), lista (renderização/eventos) e bootstrap do app.

## Integração testada

Fluxo completo validado via `docker compose up -d --build` passando pelo proxy nginx (porta 4200): criar, listar, atualizar, rejeitar e-mail duplicado (409), remover (204) e confirmar 404 após remoção.

## Como testar

```bash
docker compose up -d --build
# http://localhost:4200
```

ou rodando cada parte isoladamente — ver `backend/README.md` e `frontend/README.md`.
