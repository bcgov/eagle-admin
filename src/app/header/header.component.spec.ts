import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ApiService } from '../services/api';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;
  let configServiceSpy: any;
  let keycloakServiceSpy: jasmine.SpyObj<KeycloakService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;
  let mockConfigSignal: any;

  beforeEach(async () => {
    mockConfigSignal = signal({ ENVIRONMENT: 'dev', BANNER_COLOUR: 'orange' });
    configServiceSpy = {};
    Object.defineProperty(configServiceSpy, 'config', { value: mockConfigSignal });

    apiSpy = jasmine.createSpyObj('ApiService', ['logout']);
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['reset']);
    keycloakServiceSpy = jasmine.createSpyObj('KeycloakService', ['getToken', 'isAuthenticated', 'getLogoutURL']);
    modalSpy = jasmine.createSpyObj('NgbModal', ['open']);

    keycloakServiceSpy.isAuthenticated.and.returnValue(true);
    keycloakServiceSpy.getToken.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiSpy },
        { provide: AnalyticsService, useValue: analyticsSpy },
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: KeycloakService, useValue: keycloakServiceSpy },
        { provide: NgbModal, useValue: modalSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render banner based on environment configuration', () => {
    fixture.detectChanges();
    const banner = fixture.debugElement.query(By.css('.env-banner'));
    expect(banner).toBeTruthy();
    expect(banner.nativeElement.textContent).toContain('dev');
    expect(banner.nativeElement.classList.contains('orange')).toBeTrue();
  });

  it('should dynamically render calculator button when authenticated and routed', async () => {
    // 1. Initial render without token
    fixture.detectChanges();
    let calcLink = fixture.debugElement.query(By.css('a[title="Open Calculator"]'));
    expect(calcLink).toBeNull();

    // 2. Mock active authentication token
    const fakeJwt = { preferred_username: 'admin', realm_access: { roles: ['sysadmin'] } };
    const fakeToken = 'header.' + btoa(JSON.stringify(fakeJwt)) + '.signature';
    keycloakServiceSpy.getToken.and.returnValue(fakeToken);

    // 3. Trigger router event by navigating
    const router = TestBed.inject(Router);
    await router.navigate(['/']);
    fixture.detectChanges();

    // 4. Verify calculator button appears (proves OnPush ChangeDetectorRef.markForCheck is working)
    calcLink = fixture.debugElement.query(By.css('a[title="Open Calculator"]'));
    expect(calcLink).toBeTruthy();
    expect(calcLink.nativeElement.textContent).toContain('Calculator');
  });
});
