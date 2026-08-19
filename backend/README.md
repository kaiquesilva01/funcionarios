# funcionarios-api

API REST para CRUD de funcionários, feita em Spring Boot 4 (Java 21), seguindo o mesmo padrão de arquitetura hexagonal usado nos demais serviços desta pasta (`srv-saldo`).

## Stack

- Java 21 (toolchain via Gradle)
- Spring Boot 4.1.0 (Web MVC, Data JPA, Validation)
- H2 (banco em memória)
- JUnit 5, Mockito, AssertJ, ArchUnit
- Gradle (wrapper incluso) + Jacoco

## Arquitetura

Arquitetura hexagonal (ports & adapters), organizada por feature (`employee`):

```
employee/
├── domain/
│   ├── model/          Employee (record imutável, sem dependência de framework)
│   └── exception/      Exceções de negócio (EmployeeNotFoundException, EmployeeEmailAlreadyExistsException)
├── port/
│   ├── input/          Casos de uso (interfaces): Create/Update/Delete/Get/ListEmployeesUseCase
│   └── output/         EmployeeRepository (interface, sem detalhe de persistência)
├── application/
│   └── EmployeeService  Implementa todos os casos de uso, orquestra regras de negócio
└── adapter/
    ├── input/web/       EmployeeController (REST), DTOs, GlobalExceptionHandler
    └── output/jpa/      EmployeeEntity, SpringDataEmployeeRepository, JpaEmployeeRepositoryAdapter
```

Regra de dependência (garantida por teste com ArchUnit, `HexagonalArchitectureTest`):

```
adapter -> application -> port -> domain
```

`domain` não conhece Spring nem nenhuma outra camada; `port` não conhece `application`/`adapter`; `application` não conhece `adapter`. Os adapters é que dependem das portas (inversão de dependência).

## Endpoints

| Método | Rota                    | Descrição                       |
|--------|-------------------------|----------------------------------|
| GET    | /api/employees           | Lista todos os funcionários      |
| GET    | /api/employees/{id}      | Busca um funcionário por id      |
| POST   | /api/employees           | Cria um funcionário              |
| PUT    | /api/employees/{id}      | Atualiza um funcionário          |
| DELETE | /api/employees/{id}      | Remove um funcionário            |

Payload (`EmployeeRequest`):

```json
{
  "name": "Maria Silva",
  "email": "maria.silva@itau.com.br",
  "role": "Analista",
  "salary": 5000.00,
  "hireDate": "2024-01-15"
}
```

Validações: nome/cargo/e-mail obrigatórios, e-mail em formato válido e único, salário >= 0, data de admissão não pode estar no futuro. Erros de validação retornam `400`, e-mail duplicado retorna `409`, id inexistente retorna `404`.

## Rodando localmente

```bash
./gradlew bootRun
```

A API sobe em `http://localhost:8080`. Console H2 disponível em `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:funcionarios`, usuário `sa`, sem senha).

## Testes

```bash
./gradlew test
```

Cobertura: testes unitários da camada de aplicação (`EmployeeServiceTest`, com Mockito), testes de fatia web com `@WebMvcTest` (`EmployeeControllerTest`), testes de persistência com `@DataJpaTest` (`JpaEmployeeRepositoryAdapterTest`) e teste de arquitetura com ArchUnit.

## Subindo com Docker (integrado com o frontend)

O `docker-compose.yml` na raiz do monorepo sobe backend e frontend juntos:

```bash
cd ..
docker compose up -d --build
```

- Backend: `http://localhost:8080` (usado diretamente também por `http://localhost:4200/api/...`)
- Frontend: `http://localhost:4200` — o nginx do container do frontend faz proxy de `/api/*` para o serviço `backend`, então não há CORS envolvido nesse fluxo.

Para derrubar: `docker compose down` (a partir da raiz do repositório).
