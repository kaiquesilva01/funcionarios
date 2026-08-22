import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { EmployeePayload } from '../employee.model';

@Component({
  selector: 'app-employee-create-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, CurrencyPipe, DatePipe],
  templateUrl: './employee-create-confirm-dialog.html',
  styleUrl: './employee-create-confirm-dialog.scss',
})
export class EmployeeCreateConfirmDialog {
  private readonly dialogRef = inject(MatDialogRef<EmployeeCreateConfirmDialog>);

  protected readonly payload = inject<EmployeePayload>(MAT_DIALOG_DATA);

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
