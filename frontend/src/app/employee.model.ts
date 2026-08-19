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
