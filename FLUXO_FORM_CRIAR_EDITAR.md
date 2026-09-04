# Fluxo: Criar vs Editar Funcionário (Frontend)

## Resumo executivo

A aplicação diferencia entre **"criar novo"** e **"editar existente"** através de um signal `editingEmployeeId`:
- `null` → formulário em modo **criar**
- com valor → formulário em modo **editar**

O form se comporta diferente em cada modo (título, rótulo do botão, exibição de "cancelar"), mas a **lógica de submissão é a mesma**. A decisão de chamar `create()` ou `update()` na API acontece no componente pai (`App`), não no formulário.

---

## 1. O sinal que controla tudo: `editingEmployeeId`

### Em `app.ts:29`

```typescript
protected readonly editingEmployeeId = signal<string | null>(null);
```

**Esse é o "chaveador" da aplicação:**
- **Valor inicial**: `null` (nenhuma edição em andamento, formulário vazio)
- **Quando muda para `string`**: Usuário clicou em "editar" → formulário deve popular com aquele funcionário
- **Quando volta para `null`**: Usuário enviou o form ou clicou em "cancelar" → formulário limpa

### Quem modifica esse signal?

| Ação | Método | Novo valor |
|------|--------|-----------|
| Clica em "editar" na tabela | `onEdit(employee)` → linha 63-65 | `employee.id` |
| Clica em "cancelar" | `onCancel()` → linha 67-69 | `null` |
| Salva (CREATE ou UPDATE) com sucesso | `onSave()` → linha 53 | `null` |

---

## 2. O computed `editingEmployee` — derivar o objeto completo do ID

### Em `app.ts:31-33`

```typescript
protected readonly editingEmployee = computed(
  () => this.employees().find((employee) => employee.id === this.editingEmployeeId()) ?? null,
);
```

**O que faz:**
- Busca dentro do array `employees()` o funcionário cujo `id` bate com `editingEmployeeId()`
- Se encontra → retorna o objeto `Employee` completo
- Se não encontra ou `editingEmployeeId()` é `null` → retorna `null`

**Por quê não guardar o `Employee` inteiro?**
- Mantém uma única fonte de verdade: `employees`
- Se a lista recarregar após um update, o `computed` automaticamente pega a **versão mais fresca** do funcionário com aquele id
- Não precisa sincronizar dois estados (`editingEmployeeId` + `editingEmployee`)

---

## 3. Passando dados do pai para o filho: `[editingEmployee]="editingEmployee()"`

### Em `app.html:9-10`

```html
<app-employee-form
  [editingEmployee]="editingEmployee()"
  [saving]="saving()"
  (save)="onSave($event)"
  (cancel)="onCancel()"
/>
```

**Property binding `[editingEmployee]="editingEmployee()"`:**
- Passa o valor do `computed` (`editingEmployee()`) como `@input` do filho
- Angular reconhece quando muda e avisa o filho

### No filho, em `employee-form.ts:28`

```typescript
readonly editingEmployee = input<Employee | null>(null);
```

**Tipo:**
- `Employee | null` — pode ser um objeto completo ou nada
- Input inicial é `null` (formulário vazio)

---

## 4. O `effect()` — reage quando `editingEmployee` muda

### Em `employee-form.ts:42-56`

```typescript
constructor() {
  effect(() => {
    const employee = this.editingEmployee();
    this.form.reset(
      employee
        ? {
            name: employee.name,
            email: employee.email,
            role: employee.role,
            salary: employee.salary,
            hireDate: employee.hireDate,
          }
        : EMPTY_FORM_VALUE,
    );
  });
}
```

**O que acontece:**

| Cenário | `editingEmployee()` | Comportamento |
|---------|-------------------|--------------|
| **Criar novo** | `null` | `form.reset(EMPTY_FORM_VALUE)` → limpa todos os campos |
| **Editar** | `{id: "123", name: "João", ...}` | `form.reset({name: "João", ...})` → popula com os dados |
| **Cancela edição** | muda para `null` | `form.reset(EMPTY_FORM_VALUE)` → volta vazio |

**Por que `effect()`?**
- É um "observador" que reage sempre que o input `editingEmployee` mudar
- Sem ele, o form não limparia/preencheria automaticamente

---

## 5. O título e rótulos mudam de acordo com o modo

### Em `employee-form.html:3`

```html
<mat-card-title>{{ editingEmployee() ? 'Editar funcionário' : 'Novo funcionário' }}</mat-card-title>
```

**Lógica:**
- Se `editingEmployee()` é `truthy` (um objeto) → exibe "Editar funcionário"
- Se é `null` → exibe "Novo funcionário"

### No botão de submit, em `employee-form.html:52`

```html
{{ editingEmployee() ? 'Atualizar funcionário' : 'Criar funcionário' }}
```

Mesmo padrão: título do botão muda, mas o **comportamento dele é o mesmo** (`(ngSubmit)="submit()"` sempre).

### Botão "Cancelar" só aparece em modo edição, em `employee-form.html:55-56`

```html
@if (editingEmployee()) {
  <button mat-button type="button" (click)="onCancel()">Cancelar edição</button>
}
```

Lógica com `@if`: só renderiza se estiver editando.

---

## 6. Enviar o form — a decisão de CREATE vs UPDATE

### No filho, em `employee-form.ts:59-66`

```typescript
protected submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.save.emit(this.normalizePayload());
}
```

**O filho NÃO sabe se é create ou update!**
- Só emite um evento `save` com os dados do form (normalizados)
- Toda a lógica de diferenciar é no pai

### No pai, em `app.ts:39-61`

```typescript
protected onSave(payload: EmployeePayload): void {
  const editingId = this.editingEmployeeId();
  this.saving.set(true);

  const request = editingId
    ? this.employeesService.update(editingId, payload)
    : this.employeesService.create(payload);

  request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: () => {
      this.saving.set(false);
      this.snackBar.open(editingId ? 'Funcionário atualizado.' : 'Funcionário criado.', ...);
      this.editingEmployeeId.set(null);
      this.loadEmployees();
    },
    error: (error: Error) => {
      this.saving.set(false);
      this.snackBar.open(error.message, ...);
    },
  });
}
```

**Decisão ternária:**
```typescript
const request = editingId
  ? this.employeesService.update(editingId, payload)
  : this.employeesService.create(payload);
```

- Se `editingId` tem valor → chama `update(id, payload)` → `PUT /api/employees/{id}`
- Se `editingId` é `null` → chama `create(payload)` → `POST /api/employees`

**Após sucesso:**
- Mostra mensagem diferente ("atualizado" vs "criado")
- **Sempre** limpa `editingEmployeeId` com `set(null)`
- **Sempre** recarrega a lista com `loadEmployees()`

---

## Diagrama: Fluxo completo CRIAR

```
┌─────────────────────────────────────────────────────────────────┐
│ CRIAR NOVO FUNCIONÁRIO                                          │
└─────────────────────────────────────────────────────────────────┘

1. Página abre
   └─> editingEmployeeId = null
   └─> editingEmployee (computed) = null
   └─> effect() roda → form.reset(EMPTY_FORM_VALUE)
   └─> Template exibe "Novo funcionário"

2. Usuário preenche o form e clica "Criar funcionário"
   └─> form.submit() → EmployeeForm.submit()
   └─> save.emit(payload) → App.onSave(payload)

3. No App.onSave():
   editingId = editingEmployeeId() = null
   → chama employeesService.create(payload)
   → POST /api/employees

4. Backend responde com sucesso
   └─> snackBar.open("Funcionário criado.")
   └─> editingEmployeeId.set(null)  [já era null]
   └─> loadEmployees()
   └─> Lista atualiza e novo funcionário aparece
```

---

## Diagrama: Fluxo completo EDITAR

```
┌─────────────────────────────────────────────────────────────────┐
│ EDITAR FUNCIONÁRIO EXISTENTE                                    │
└─────────────────────────────────────────────────────────────────┘

1. Página carrega, lista exibe "João (id: 123)"
   └─> editingEmployeeId = null
   └─> form vazio

2. Usuário clica "editar" na linha de João
   └─> EmployeeList.edit($event) → App.onEdit(employee)

3. No App.onEdit():
   editingEmployeeId.set(employee.id)  [agora = "123"]
   └─> editingEmployee (computed) roda
   └─> busca employee com id="123" em this.employees()
   └─> retorna {id: "123", name: "João", ...}

4. Property binding atualiza o filho:
   [editingEmployee]="editingEmployee()" passa o objeto
   └─> effect() no EmployeeForm roda
   └─> form.reset({name: "João", ...})
   └─> Template exibe "Editar funcionário"
   └─> Botão mostra "Atualizar funcionário"
   └─> Botão "Cancelar edição" aparece

5. Usuário muda "Salário" de 5000 para 6000 e clica "Atualizar funcionário"
   └─> form.submit() → EmployeeForm.submit()
   └─> save.emit(payload_modificado)

6. No App.onSave():
   editingId = editingEmployeeId() = "123"
   → chama employeesService.update("123", payload_modificado)
   → PUT /api/employees/123

7. Backend responde com sucesso
   └─> snackBar.open("Funcionário atualizado.")
   └─> editingEmployeeId.set(null)
   └─> loadEmployees()
   └─> Lista recarrega, João agora aparece com salário 6000
   └─> form volta vazio ("Novo funcionário")
```

---

## Diagrama: Fluxo de CANCELAMENTO

```
┌─────────────────────────────────────────────────────────────────┐
│ CANCELAR EDIÇÃO (descartar mudanças)                            │
└─────────────────────────────────────────────────────────────────┘

1. Usuário está editando João
   └─> editingEmployeeId = "123"
   └─> form tem os dados dele
   └─> Botão "Cancelar edição" está visível

2. Usuário clica "Cancelar edição"
   └─> (click)="onCancel()" → EmployeeForm.cancel.emit()
   └─> App.onCancel()

3. No App.onCancel():
   editingEmployeeId.set(null)
   └─> editingEmployee (computed) = null
   └─> effect() no filho roda
   └─> form.reset(EMPTY_FORM_VALUE)
   └─> Template volta para "Novo funcionário"
   └─> Botão "Cancelar edição" desaparece
```

---

## Resumo técnico: Estados e transições

```
Estados do signal editingEmployeeId:
┌─────────────────────────────────────────────────────┐
│                    null                             │
│         (Formulário em modo CRIAR)                  │
└──────┬────────────────────────────────┬─────────────┘
       │                                │
    clica                            salva/
    editar                           cancela
       │                                │
       ▼                                ▼
┌──────────────────────────────────────────────────────┐
│                  "123" (id)                          │
│         (Formulário em modo EDITAR)                  │
└──────┬────────────────────────────────┬─────────────┘
       │                                │
   cancela                          salva/
       │                            cancela
       └────────────────┬─────────────┘
                        │
                        ▼
                     null
```

---

## Checklist de compreensão

- [ ] `editingEmployeeId` é `null` quando criando, e tem um `id` quando editando
- [ ] O `computed` busca o objeto completo derivado apenas do id
- [ ] O `effect()` no formulário reage a mudanças do `input` e popula/limpa o form
- [ ] O formulário **não sabe** se é create ou update; emite apenas `save`
- [ ] O pai (`App`) decide se chama `create()` ou `update()` baseado em `editingEmployeeId`
- [ ] Após salvar, `editingEmployeeId` volta para `null` e lista recarrega
- [ ] O título, rótulo do botão e visibilidade do "cancelar" mudam dinamicamente
