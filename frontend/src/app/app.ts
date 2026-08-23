import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeCreateConfirmDialog } from './employee-create-confirm-dialog/employee-create-confirm-dialog';
import { EmployeeRemoveConfirmDialog } from './employee-remove-confirm-dialog/employee-remove-confirm-dialog';
import { EmployeeForm } from './employee-form/employee-form';
import { EmployeeList } from './employee-list/employee-list';
import { Employee, EmployeePayload } from './employee.model';
import { EmployeesService } from './employees.service';

const SNACKBAR_DURATION_MS = 2500;
const SNACKBAR_ERROR_DURATION_MS = 3500;
const FILTER_DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    EmployeeForm,
    EmployeeList,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  private readonly filterChanges = new Subject<void>();

  protected readonly employees = signal<Employee[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editingEmployeeId = signal<string | null>(null);
  protected readonly roleFilter = signal('');
  protected readonly search = signal('');
  protected readonly page = signal(0);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  protected readonly sortField = signal('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  protected readonly editingEmployee = computed(
    () => this.employees().find((employee) => employee.id === this.editingEmployeeId()) ?? null,
  );

  protected readonly emptyMessage = computed(() =>
    this.roleFilter().trim() || this.search().trim()
      ? 'Nenhum funcionário encontrado para os filtros pesquisados.'
      : 'Nenhum funcionário cadastrado.',
  );

  ngOnInit(): void {
    this.filterChanges
      .pipe(debounceTime(FILTER_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadEmployees());

    this.loadEmployees();
  }

  protected onRoleFilterChange(value: string): void {
    this.roleFilter.set(value);
    this.page.set(0);
    this.filterChanges.next();
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(0);
    this.filterChanges.next();
  }

  protected onClearFilter(): void {
    this.roleFilter.set('');
    this.page.set(0);
    this.loadEmployees();
  }

  protected onSortChange(sort: Sort): void {
    this.sortField.set(sort.direction ? sort.active : 'name');
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.page.set(0);
    this.loadEmployees();
  }

  protected onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEmployees();
  }

  protected onSave(payload: EmployeePayload): void {
    const editingId = this.editingEmployeeId();

    if (editingId) {
      this.persist(editingId, payload);
      return;
    }

    this.dialog
      .open(EmployeeCreateConfirmDialog, { data: payload })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.persist(null, payload);
        }
      });
  }

  private persist(editingId: string | null, payload: EmployeePayload): void {
    this.saving.set(true);

    const request = editingId
      ? this.employeesService.update(editingId, payload)
      : this.employeesService.create(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(editingId ? 'Funcionário atualizado.' : 'Funcionário criado.', 'Fechar', {
          duration: SNACKBAR_DURATION_MS,
        });
        this.editingEmployeeId.set(null);
        this.loadEmployees();
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.snackBar.open(error.message, 'Fechar', { duration: SNACKBAR_ERROR_DURATION_MS });
      },
    });
  }

  protected onEdit(employee: Employee): void {
    this.editingEmployeeId.set(employee.id);
  }

  protected onCancel(): void {
    this.editingEmployeeId.set(null);
  }

  protected onRemove(employee: Employee): void {
    this.dialog
      .open(EmployeeRemoveConfirmDialog, { data: employee })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.removeEmployee(employee);
        }
      });
  }

  private removeEmployee(employee: Employee): void {
    this.employeesService
      .remove(employee.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Funcionário removido.', 'Fechar', { duration: SNACKBAR_DURATION_MS });
          if (this.editingEmployeeId() === employee.id) {
            this.editingEmployeeId.set(null);
          }
          this.loadEmployees();
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Fechar', { duration: SNACKBAR_ERROR_DURATION_MS });
        },
      });
  }

  private loadEmployees(): void {
    this.loading.set(true);
    this.employeesService
      .list({
        role: this.roleFilter(),
        search: this.search(),
        page: this.page(),
        size: this.pageSize(),
        sort: `${this.sortField()},${this.sortDirection()}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.employees.set(result.content);
          this.totalElements.set(result.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('Backend indisponível. Inicie a API Spring Boot.', 'Fechar', {
            duration: SNACKBAR_ERROR_DURATION_MS,
          });
        },
      });
  }
}
