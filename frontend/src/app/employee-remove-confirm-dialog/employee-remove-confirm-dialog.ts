import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-remove-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './employee-remove-confirm-dialog.html',
  styleUrl: './employee-remove-confirm-dialog.scss',
})
export class EmployeeRemoveConfirmDialog {
  private readonly dialogRef = inject(MatDialogRef<EmployeeRemoveConfirmDialog>);

  protected readonly employee = inject<Employee>(MAT_DIALOG_DATA);

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
