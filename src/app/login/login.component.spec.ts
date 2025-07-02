import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { Utils } from 'src/app/shared/utils/utils';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Use createSpyObj for router and keycloak
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const keycloakSpy = jasmine.createSpyObj('KeycloakService', ['keycloakEnabled']);

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule
      ],
      providers: [
        ApiService,
        { provide: KeycloakService, useValue: keycloakSpy },
        { provide: Router, useValue: routerSpy },
        ConfigService,
        Utils,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        // Add provideRouter for router testing
        require('@angular/router').provideRouter([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when keycloak is enabled', () => {
    beforeEach(() => {
      keycloakSpy.keycloakEnabled.and.returnValue(true);
    });

    it('redirects to root', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
