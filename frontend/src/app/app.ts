import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeCreateConfirmDialog } from './employee-create-confirm-dialog/employee-create-confirm-dialog';
import { EmployeeForm } from './employee-form/employee-form';
import { EmployeeList } from './employee-list/employee-list';
import { Employee, EmployeePayload } from './employee.model';
import { EmployeesService } from './employees.service';

const SNACKBAR_DURATION_MS = 2500;
const SNACKBAR_ERROR_DURATION_MS = 3500;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatProgressSpinnerModule, MatSnackBarModule, EmployeeForm, EmployeeList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editingEmployeeId = signal<string | null>(null);

  protected readonly editingEmployee = computed(
    () => this.employees().find((employee) => employee.id === this.editingEmployeeId()) ?? null,
  );

  ngOnInit(): void {
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
    const confirmed = window.confirm(`Remover o funcionário "${employee.name}"?`);
    if (!confirmed) {
      return;
    }

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
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employees) => {
          this.employees.set(employees);
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
