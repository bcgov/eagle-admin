import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AddEditProjectComponent } from './add-edit-project.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';

const FULL_PROJECT = {
  _id: 'eagle-1',
  currentLegislationYear: 'legislation_2018',
  legislationYearList: [2018],
  legislation_2018: { name: 'Red Chris' },
  isPublished: false
};

describe('AddEditProjectComponent', () => {
  let http: HttpTestingController;
  let storage: StorageService;
  let fixture: ComponentFixture<AddEditProjectComponent>;

  function create(path: string, data: object) {
    TestBed.configureTestingModule({
      imports: [AddEditProjectComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { url: of([{ path }]), data: of(data), snapshot: {} } },
        { provide: ConfigService, useValue: { lists: [], getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    fixture = TestBed.createComponent(AddEditProjectComponent);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  it('edits the project the route resolved and makes no request of its own', () => {
    const component = create('edit', { fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] });

    http.verify();
    expect(component.project.name).toBe('Red Chris');
    expect(storage.state.projectDetailId).toBe('eagle-1');
    expect(component.tabLinks.map(t => t.link)).toEqual(['form-2018']);
  });

  it('marks the published legislation tab from isPublished', () => {
    const published = (isPublished: boolean) => {
      create('edit', { fullProject: [{ data: { searchResults: [{ ...FULL_PROJECT, isPublished }] } }] });
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.badge-published');
      TestBed.resetTestingModule();
      return badge !== null;
    };

    expect(published(true)).toBeTrue();
    expect(published(false)).toBeFalse();
  });

  it('starts empty when adding a project', () => {
    const component = create('add', {});

    http.verify();
    expect(component.fullProject).toBeNull();
    expect(component.tabLinks.map(t => t.link)).toEqual(['form-2018']);
  });
});
