import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { Employee, EmployeeListParams, EmployeePayload, PagedResponse } from './employee.model';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/employees`;

  const sampleEmployee: Employee = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Maria Silva',
    email: 'maria.silva@itau.com.br',
    role: 'Analista',
    salary: 5000,
    hireDate: '2024-01-15',
  };

  const samplePage: PagedResponse<Employee> = {
    content: [sampleEmployee],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  const defaultParams: EmployeeListParams = { page: 0, size: 10, sort: 'name,asc' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EmployeesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists employees', () => {
    service.list(defaultParams).subscribe((result) => {
      expect(result).toEqual(samplePage);
    });

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(samplePage);
  });

  it('sends page, size and sort params', () => {
    service.list(defaultParams).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('name,asc');
    req.flush(samplePage);
  });

  it('does not send a role or search param when no filter is given', () => {
    service.list(defaultParams).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.params.has('role')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush(samplePage);
  });

  it('does not send a role param when the filter is empty or blank', () => {
    service.list({ ...defaultParams, role: '   ' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.params.has('role')).toBe(false);
    req.flush(samplePage);
  });

  it('sends a trimmed role param when a filter is given', () => {
    service.list({ ...defaultParams, role: '  dev  ' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl && request.params.get('role') === 'dev');
    expect(req.request.params.get('role')).toBe('dev');
    req.flush(samplePage);
  });

  it('sends a trimmed search param when given', () => {
    service.list({ ...defaultParams, search: '  maria  ' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl && request.params.get('search') === 'maria');
    expect(req.request.params.get('search')).toBe('maria');
    req.flush(samplePage);
  });

  it('creates an employee', () => {
    const payload: EmployeePayload = {
      name: sampleEmployee.name,
      email: sampleEmployee.email,
      role: sampleEmployee.role,
      salary: sampleEmployee.salary,
      hireDate: sampleEmployee.hireDate,
    };

    service.create(payload).subscribe((employee) => {
      expect(employee).toEqual(sampleEmployee);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(sampleEmployee);
  });

  it('updates an employee', () => {
    service.update(sampleEmployee.id, sampleEmployee).subscribe((employee) => {
      expect(employee).toEqual(sampleEmployee);
    });

    const req = httpMock.expectOne(`${baseUrl}/${sampleEmployee.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(sampleEmployee);
  });

  it('removes an employee', () => {
    service.remove(sampleEmployee.id).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/${sampleEmployee.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('maps server error message on failure', () => {
    let capturedError: Error | undefined;

    service.list(defaultParams).subscribe({
      error: (error: Error) => (capturedError = error),
    });

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    req.flush({ message: 'Falha ao listar' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError?.message).toBe('Falha ao listar');
  });
});
