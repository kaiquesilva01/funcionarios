import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { EmployeeCreateConfirmDialog } from './employee-create-confirm-dialog';
import { EmployeePayload } from '../employee.model';

const PAYLOAD: EmployeePayload = {
  name: 'Maria Silva',
  email: 'maria.silva@itau.com.br',
  role: 'Analista',
  salary: 5000,
  hireDate: '2024-01-15',
};

describe('EmployeeCreateConfirmDialog', () => {
  let dialogRefStub: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRefStub = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EmployeeCreateConfirmDialog],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: PAYLOAD },
      ],
    }).compileComponents();
  });

  it('closes with false on cancel', () => {
    const fixture = TestBed.createComponent(EmployeeCreateConfirmDialog);
    (fixture.componentInstance as unknown as { onCancel(): void }).onCancel();

    expect(dialogRefStub.close).toHaveBeenCalledWith(false);
  });

  it('closes with true on confirm', () => {
    const fixture = TestBed.createComponent(EmployeeCreateConfirmDialog);
    (fixture.componentInstance as unknown as { onConfirm(): void }).onConfirm();

    expect(dialogRefStub.close).toHaveBeenCalledWith(true);
  });
});
