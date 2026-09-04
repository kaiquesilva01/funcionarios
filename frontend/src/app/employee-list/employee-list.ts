import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatPaginatorModule, MatSortModule, MatTableModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
})
export class EmployeeList {
  readonly employees = input.required<Employee[]>();
  readonly emptyMessage = input('Nenhum funcionário cadastrado.');
  readonly totalElements = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(10);
  readonly sortField = input('name');
  readonly sortDirection = input<'asc' | 'desc'>('asc');

  readonly edit = output<Employee>();
  readonly remove = output<Employee>();
  readonly sortChange = output<Sort>();
  readonly pageChange = output<PageEvent>();

  protected readonly displayedColumns = ['index', 'name', 'email', 'role', 'salary', 'hireDate', 'actions'];
  protected readonly pageSizeOptions = [10, 25, 50];
}
