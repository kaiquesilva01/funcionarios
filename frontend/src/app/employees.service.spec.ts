import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { Employee, EmployeePayload } from './employee.model';
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
    service.list().subscribe((employees) => {
      expect(employees).toEqual([sampleEmployee]);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([sampleEmployee]);
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

    service.list().subscribe({
      error: (error: Error) => (capturedError = error),
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'Falha ao listar' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError?.message).toBe('Falha ao listar');
  });
});
