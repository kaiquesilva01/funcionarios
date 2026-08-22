import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
})
export class EmployeeList {
  readonly employees = input.required<Employee[]>();
  readonly emptyMessage = input('Nenhum funcionário cadastrado.');

  readonly edit = output<Employee>();
  readonly remove = output<Employee>();

  protected readonly displayedColumns = ['index', 'name', 'email', 'role', 'salary', 'hireDate', 'actions'];
}
