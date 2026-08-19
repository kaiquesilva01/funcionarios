import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { App } from './app';
import { EmployeesService } from './employees.service';

describe('App', () => {
  beforeEach(async () => {
    const employeesServiceStub: Partial<EmployeesService> = {
      list: () => of([]),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNoopAnimations(), { provide: EmployeesService, useValue: employeesServiceStub }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gerencie funcionários');
  });
});
