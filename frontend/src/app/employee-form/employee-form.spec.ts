import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EmployeeForm } from './employee-form';

describe('EmployeeForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('does not emit save when the form is invalid', () => {
    const fixture = TestBed.createComponent(EmployeeForm);
    const component = fixture.componentInstance;
    let emitted = false;
    component.save.subscribe(() => (emitted = true));

    (component as unknown as { submit(): void }).submit();

    expect(emitted).toBe(false);
  });

  it('emits a normalized payload when the form is valid', () => {
    const fixture = TestBed.createComponent(EmployeeForm);
    const component = fixture.componentInstance;
    let emittedPayload: unknown;
    component.save.subscribe((payload) => (emittedPayload = payload));

    const form = (component as unknown as { form: FormGroup }).form;
    form.setValue({
      name: '  Maria Silva  ',
      email: 'maria.silva@itau.com.br',
      role: '  Analista  ',
      salary: 5000,
      hireDate: '2024-01-15',
    });

    (component as unknown as { submit(): void }).submit();

    expect(emittedPayload).toEqual({
      name: 'Maria Silva',
      email: 'maria.silva@itau.com.br',
      role: 'Analista',
      salary: 5000,
      hireDate: '2024-01-15',
    });
  });

  it('resets the form when editingEmployee becomes null', () => {
    const fixture = TestBed.createComponent(EmployeeForm);
    fixture.componentRef.setInput('editingEmployee', {
      id: '1',
      name: 'Maria Silva',
      email: 'maria.silva@itau.com.br',
      role: 'Analista',
      salary: 5000,
      hireDate: '2024-01-15',
    });
    fixture.detectChanges();

    fixture.componentRef.setInput('editingEmployee', null);
    fixture.detectChanges();

    const form = (fixture.componentInstance as unknown as { form: FormGroup }).form;
    expect(form.value.name).toBe('');
  });
});
