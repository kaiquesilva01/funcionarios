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
});
