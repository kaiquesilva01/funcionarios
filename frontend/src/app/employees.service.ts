import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Employee, EmployeeListParams, EmployeePayload, PagedResponse } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  list(params: EmployeeListParams): Observable<PagedResponse<Employee>> {
    let httpParams = new HttpParams().set('page', params.page).set('size', params.size).set('sort', params.sort);

    const role = params.role?.trim();
    if (role) {
      httpParams = httpParams.set('role', role);
    }

    const search = params.search?.trim();
    if (search) {
      httpParams = httpParams.set('search', search);
    }

    return this.http
      .get<PagedResponse<Employee>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  create(payload: EmployeePayload): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, payload).pipe(catchError(this.handleError));
  }

  update(id: string, payload: EmployeePayload): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, payload).pipe(catchError(this.handleError));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message ?? 'Não foi possível concluir a operação.';
    return throwError(() => new Error(message));
  }
}
