import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { SideBarService } from '../services/sidebar.service';
import { StorageService } from '../services/storage.service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let configServiceSpy: any;
  let keycloakServiceSpy: jasmine.SpyObj<KeycloakService>;
  let sideBarServiceSpy: jasmine.SpyObj<SideBarService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let mockConfigSignal: any;

  beforeEach(async () => {
    mockConfigSignal = signal({ ENVIRONMENT: 'dev' });
    const mockListsSignal = signal([]);
    configServiceSpy = jasmine.createSpyObj('ConfigService', ['ensureListsLoaded']);
    Object.defineProperty(configServiceSpy, 'config', { value: mockConfigSignal });
    Object.defineProperty(configServiceSpy, 'listsSignal', { value: mockListsSignal });

    keycloakServiceSpy = jasmine.createSpyObj('KeycloakService', ['getUserRoles']);
    keycloakServiceSpy.getUserRoles.and.returnValue([]);

    sideBarServiceSpy = jasmine.createSpyObj('SideBarService', [], {
      archiveChange: new BehaviorSubject<boolean>(false),
      toggleChange: new BehaviorSubject<boolean>(false)
    });

    storageServiceSpy = jasmine.createSpyObj('StorageService', [], {
      state: { projectDocumentTableParams: null }
    });

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: KeycloakService, useValue: keycloakServiceSpy },
        { provide: SideBarService, useValue: sideBarServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show preview section in non-prod environment', () => {
    mockConfigSignal.set({ ENVIRONMENT: 'dev' });
    fixture.detectChanges();
    const previewDiv = fixture.debugElement.query(By.css('.sidebar-section-divider'));
    expect(previewDiv).toBeTruthy();
    expect(previewDiv.nativeElement.textContent).toContain('Preview');
  });

  it('should hide preview section in prod environment', () => {
    mockConfigSignal.set({ ENVIRONMENT: 'prod' });
    fixture.detectChanges();
    const previewDiv = fixture.debugElement.query(By.css('.sidebar-section-divider'));
    expect(previewDiv).toBeNull();
  });
});
