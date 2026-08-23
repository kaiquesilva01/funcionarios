export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  hireDate: string;
}

export interface EmployeePayload {
  name: string;
  email: string;
  role: string;
  salary: number;
  hireDate: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface EmployeeListParams {
  role?: string;
  search?: string;
  page: number;
  size: number;
  sort: string;
}
