import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'src/app/services/api';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { Utils } from 'src/app/shared/utils/utils';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockKeycloakService = {
    isKeyCloakEnabled: () => {
      return false;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ApiService },
        { provide: KeycloakService, useValue: mockKeycloakService },
        { provide: Router, useValue: routerSpy },
        ConfigService,
        Utils
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
    let service: KeycloakService;
    beforeEach(() => {
      service = TestBed.get(KeycloakService);
      spyOn(service, 'isKeyCloakEnabled').and.returnValue(true);
    });

    it('redirects to root', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
