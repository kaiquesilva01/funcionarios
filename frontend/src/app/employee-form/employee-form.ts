import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Employee, EmployeePayload } from '../employee.model';

const EMPTY_FORM_VALUE = {
  name: '',
  email: '',
  role: '',
  salary: 0,
  hireDate: '',
};

@Component({
  selector: 'app-employee-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
})
export class EmployeeForm {
  private readonly fb = inject(FormBuilder);

  readonly editingEmployee = input<Employee | null>(null);
  readonly saving = input(false);

  readonly save = output<EmployeePayload>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]],
    salary: [0, [Validators.required, Validators.min(0)]],
    hireDate: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const employee = this.editingEmployee();
      this.form.reset(
        employee
          ? {
              name: employee.name,
              email: employee.email,
              role: employee.role,
              salary: employee.salary,
              hireDate: employee.hireDate,
            }
          : EMPTY_FORM_VALUE,
      );
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.normalizePayload());
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  private normalizePayload(): EmployeePayload {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role.trim(),
      salary: Number(value.salary),
      hireDate: value.hireDate,
    };
  }
}
