import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GateComponent } from './gate.component';
import { GateService } from '../services/gate.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';

describe('GateComponent', () => {
  let component: GateComponent;
  let fixture: ComponentFixture<GateComponent>;
  let gateSpy: jasmine.SpyObj<GateService>;
  let keycloakSpy: jasmine.SpyObj<KeycloakService>;

  function errorText(): string {
    return fixture.nativeElement.querySelector('.alert-danger')?.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    gateSpy = jasmine.createSpyObj('GateService', ['unlock']);
    keycloakSpy = jasmine.createSpyObj('KeycloakService', ['init']);
    keycloakSpy.init.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [GateComponent],
      providers: [
        { provide: GateService, useValue: gateSpy },
        { provide: KeycloakService, useValue: keycloakSpy },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a password field and a submit button', () => {
    expect(fixture.nativeElement.querySelector('input#gate-password[type="password"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeTruthy();
    expect(errorText()).toBe('');
  });

  it('shows a wrong-password message on 401 and does not start Keycloak', async () => {
    gateSpy.unlock.and.rejectWith({ status: 401 });

    component.password = 'nope';
    await component.submit();
    fixture.detectChanges();

    expect(errorText()).toContain('not correct');
    expect(keycloakSpy.init).not.toHaveBeenCalled();
    expect(component.busy()).toBe(false);
  });

  it('shows a generic message when the check itself fails', async () => {
    gateSpy.unlock.and.rejectWith({ status: 0 });

    await component.submit();
    fixture.detectChanges();

    expect(errorText()).toContain('could not be checked');
  });

  it('unlocks and starts Keycloak on 204', async () => {
    gateSpy.unlock.and.resolveTo();

    component.password = 'hunter2';
    await component.submit();
    fixture.detectChanges();

    expect(gateSpy.unlock).toHaveBeenCalledWith('hunter2');
    expect(keycloakSpy.init).toHaveBeenCalled();
    expect(errorText()).toBe('');
  });
});
