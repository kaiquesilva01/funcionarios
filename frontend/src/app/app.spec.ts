import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { Employee, EmployeePayload, PagedResponse } from './employee.model';
import { EmployeesService } from './employees.service';

const EMPTY_PAGE: PagedResponse<Employee> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };

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
      list: vi.fn().mockReturnValue(of(EMPTY_PAGE)),
      create: vi.fn().mockReturnValue(of(undefined)),
      update: vi.fn().mockReturnValue(of(undefined)),
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

  it('filters employees after a debounce when typing in the role filter', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();

    (fixture.componentInstance as unknown as { onRoleFilterChange(value: string): void }).onRoleFilterChange('dev');

    expect(employeesServiceStub.list).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ role: 'dev', page: 0 }));
    vi.useRealTimers();
  });

  it('filters employees after a debounce when typing in the search field', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();

    (fixture.componentInstance as unknown as { onSearchChange(value: string): void }).onSearchChange('maria');

    expect(employeesServiceStub.list).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'maria', page: 0 }));
    vi.useRealTimers();
  });

  it('clears the filter and reloads immediately without waiting for the debounce', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      onRoleFilterChange(value: string): void;
      onClearFilter(): void;
    };
    component.onRoleFilterChange('dev');
    vi.advanceTimersByTime(300);
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();

    component.onClearFilter();

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ role: '', page: 0 }));
    vi.useRealTimers();
  });

  it('reorders and resets to the first page when a column sort changes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();
    const component = fixture.componentInstance as unknown as {
      onPageChange(event: { pageIndex: number; pageSize: number; length: number }): void;
      onSortChange(sort: { active: string; direction: 'asc' | 'desc' | '' }): void;
    };

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 30 });
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();
    component.onSortChange({ active: 'salary', direction: 'desc' });

    expect(employeesServiceStub.list).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'salary,desc', page: 0 }),
    );
  });

  it('requests the selected page and size when the paginator changes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();
    const component = fixture.componentInstance as unknown as {
      onPageChange(event: { pageIndex: number; pageSize: number; length: number }): void;
    };

    component.onPageChange({ pageIndex: 1, pageSize: 25, length: 30 });

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 25 }));
  });

  it('keeps the active role filter when reloading after creating an employee', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as ReturnType<MatDialog['open']>);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      roleFilter: { set(value: string): void };
      onSave(payload: EmployeePayload): void;
    };
    component.roleFilter.set('dev');
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();

    component.onSave(NEW_EMPLOYEE_PAYLOAD);

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ role: 'dev' }));
  });

  it('keeps the active role filter when reloading after removing an employee', () => {
    const fixture = TestBed.createComponent(App);
    const dialog = TestBed.inject(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as ReturnType<MatDialog['open']>);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      roleFilter: { set(value: string): void };
      onRemove(employee: Employee): void;
    };
    component.roleFilter.set('dev');
    (employeesServiceStub.list as ReturnType<typeof vi.fn>).mockClear();

    component.onRemove(EXISTING_EMPLOYEE);

    expect(employeesServiceStub.list).toHaveBeenCalledWith(expect.objectContaining({ role: 'dev' }));
  });
});
