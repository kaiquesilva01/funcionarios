# funcionarios

Monorepo com o CRUD de funcionários: backend em Spring Boot (arquitetura hexagonal) e frontend em Angular + Material.

```
funcionarios/
├── backend/           API REST (Spring Boot 4.1, Java 21, H2) — ver backend/README.md
├── frontend/          SPA Angular 22 standalone + Material — ver frontend/README.md
└── docker-compose.yml Sobe os dois serviços integrados (backend:8080, frontend:4200)
```

## Rodando tudo com Docker

```bash
docker compose up -d --build
```

- `http://localhost:8080` — API (Spring Boot)
- `http://localhost:4200` — SPA (nginx), com proxy de `/api/*` para o backend

Para derrubar: `docker compose down`.

## Rodando cada parte isoladamente (sem Docker)

Veja `backend/README.md` (`./gradlew bootRun`, `./gradlew test`) e `frontend/README.md` (`npm start`, `npm test`).

## Arquitetura

- **Backend**: hexagonal (`domain` → `port` → `application` → `adapter`), regra de dependência garantida por teste ArchUnit. Detalhes em `backend/README.md`.
- **Frontend**: standalone components + signals, um smart component (`App`) e componentes de apresentação (`EmployeeForm`, `EmployeeList`). Detalhes em `frontend/README.md`.
