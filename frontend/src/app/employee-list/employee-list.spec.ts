import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Employee } from '../employee.model';
import { EmployeeList } from './employee-list';

describe('EmployeeList', () => {
  const employees: Employee[] = [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria.silva@itau.com.br',
      role: 'Analista',
      salary: 5000,
      hireDate: '2024-01-15',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('renders a row per employee', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Maria Silva');
  });

  it('emits edit and remove events', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.detectChanges();

    let editedEmployee: Employee | undefined;
    let removedEmployee: Employee | undefined;
    fixture.componentInstance.edit.subscribe((employee) => (editedEmployee = employee));
    fixture.componentInstance.remove.subscribe((employee) => (removedEmployee = employee));

    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    (buttons[0] as HTMLButtonElement).click();
    (buttons[1] as HTMLButtonElement).click();

    expect(editedEmployee).toEqual(employees[0]);
    expect(removedEmployee).toEqual(employees[0]);
  });

  it('renders the empty message when there are no employees', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', []);
    fixture.componentRef.setInput('emptyMessage', 'Nenhum funcionário encontrado para o cargo pesquisado.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeNull();
    expect(compiled.textContent).toContain('Nenhum funcionário encontrado para o cargo pesquisado.');
  });

  it('does not render the empty message when there are employees', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).not.toBeNull();
    expect(compiled.querySelector('.empty-state')).toBeNull();
  });

  it('renders the paginator with the total element count', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.componentRef.setInput('totalElements', 42);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-paginator')).not.toBeNull();
    expect(compiled.textContent).toContain('42');
  });

  it('emits pageChange when the paginator changes page', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.componentRef.setInput('totalElements', 30);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();

    let emitted: { pageIndex: number } | undefined;
    fixture.componentInstance.pageChange.subscribe((event) => (emitted = event));

    const paginatorDebugEl = fixture.debugElement.query((de) => de.name === 'mat-paginator');
    paginatorDebugEl.componentInstance.page.emit({ pageIndex: 2, pageSize: 10, length: 30 });

    expect(emitted).toEqual({ pageIndex: 2, pageSize: 10, length: 30 });
  });

  it('emits sortChange when a sortable column header is clicked', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.componentRef.setInput('employees', employees);
    fixture.detectChanges();

    let emitted: { active: string; direction: string } | undefined;
    fixture.componentInstance.sortChange.subscribe((event) => (emitted = event));

    const nameHeader = (fixture.nativeElement as HTMLElement).querySelector(
      '.mat-sort-header-container',
    ) as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    expect(emitted).toBeDefined();
    expect(emitted?.active).toBe('name');
  });
});
