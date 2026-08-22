import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { Employee, EmployeePayload } from './employee.model';
import { EmployeesService } from './employees.service';

const NEW_EMPLOYEE_PAYLOAD: EmployeePayload = {
  name: 'Maria Silva',
  email: 'maria.silva@itau.com.br',
  role: 'Analista',
  salary: 5000,
  hireDate: '2024-01-15',
};

const EXISTING_EMPLOYEE: Employee = {
  id: '1',
  name: 'Maria Silva',
  email: 'maria.silva@itau.com.br',
  role: 'Analista',
  salary: 5000,
  hireDate: '2024-01-15',
};

describe('App', () => {
  let employeesServiceStub: Partial<EmployeesService>;

  beforeEach(async () => {
    employeesServiceStub = {
      list: () => of([]),
      create: vi.fn().mockReturnValue(of(undefined)),
      remove: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNoopAnimations(), { provide: EmployeesService, useValue: employeesServiceStub }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gerencie funcionários');
  });

  it('does not create the employee until the confirmation dialog is confirmed', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) } as ReturnType<MatDialog['open']>);

    (fixture.componentInstance as unknown as { onSave(payload: EmployeePayload): void }).onSave(
      NEW_EMPLOYEE_PAYLOAD,
    );

    expect(openSpy).toHaveBeenCalled();
    expect(employeesServiceStub.create).not.toHaveBeenCalled();
  });

  it('creates the employee after the confirmation dialog is confirmed', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as ReturnType<MatDialog['open']>);

    (fixture.componentInstance as unknown as { onSave(payload: EmployeePayload): void }).onSave(
      NEW_EMPLOYEE_PAYLOAD,
    );

    expect(employeesServiceStub.create).toHaveBeenCalledWith(NEW_EMPLOYEE_PAYLOAD);
  });

  it('does not remove the employee until the confirmation dialog is confirmed', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) } as ReturnType<MatDialog['open']>);

    (fixture.componentInstance as unknown as { onRemove(employee: Employee): void }).onRemove(
      EXISTING_EMPLOYEE,
    );

    expect(openSpy).toHaveBeenCalled();
    expect(employeesServiceStub.remove).not.toHaveBeenCalled();
  });

  it('removes the employee after the confirmation dialog is confirmed', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as ReturnType<MatDialog['open']>);

    (fixture.componentInstance as unknown as { onRemove(employee: Employee): void }).onRemove(
      EXISTING_EMPLOYEE,
    );

    expect(employeesServiceStub.remove).toHaveBeenCalledWith(EXISTING_EMPLOYEE.id);
  });
});
