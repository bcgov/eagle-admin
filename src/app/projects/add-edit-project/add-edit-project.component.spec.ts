import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, ParamMap, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, isObservable, of } from 'rxjs';

import { AddEditProjectComponent } from './add-edit-project.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';

const FULL_PROJECT = {
  _id: null,
  currentLegislationYear: 'legislation_2018',
  legislationYearList: [2018],
  legislation_2018: { name: 'Red Chris' },
  isPublished: false
};

describe('AddEditProjectComponent', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<AddEditProjectComponent>;
  let route: { snapshot: { paramMap: ParamMap } } & object;
  let navigate: jasmine.Spy;

  function create(path: string, data: object | Observable<object>, tab?: string) {
    route = <typeof route>{ url: of([{ path }]), data: isObservable(data) ? data : of(data), snapshot: { paramMap: convertToParamMap(path === 'edit' ? { projId: 'demi-7' } : {}) }, firstChild: tab ? { snapshot: { url: [{ path: tab }] } } : null };
    TestBed.configureTestingModule({
      imports: [AddEditProjectComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: ConfigService, useValue: { lists: [], getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(AddEditProjectComponent);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  it('edits the project the route resolved and makes no request of its own', () => {
    const component = create('edit', { fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] });

    http.verify();
    expect(component.project.name).toBe('Red Chris');
    expect(component.tabLinks.map(t => t.link)).toEqual(['form-2018']);
  });

  it('the edit page breadcrumb links to the route id', () => {
    create('edit', { fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] });
    fixture.detectChanges();

    const projectCrumb: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('.breadcrumb a')[1];
    expect(projectCrumb.getAttribute('href')).toBe('/p/demi-7');
  });

  it('the edit page breadcrumb renders when the project could not be loaded', () => {
    create('edit', { fullProject: [{ data: { searchResults: [] } }] });
    fixture.detectChanges();

    const projectCrumb: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('.breadcrumb a')[1];
    expect(projectCrumb.getAttribute('href')).toBe('/p/demi-7');
  });

  it('takes the route id again when the page is reused for another project', () => {
    const data = new Subject<object>();
    const component = create('edit', data);
    data.next({ fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] });

    route.snapshot.paramMap = convertToParamMap({ projId: 'demi-8' });
    data.next({ fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] });

    expect(component.projectId).toBe('demi-8');
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

  it('moves a 2018-only project off the hidden form-2002 tab', () => {
    create('edit', { fullProject: [{ data: { searchResults: [FULL_PROJECT] } }] }, 'form-2002');

    expect(navigate).toHaveBeenCalledOnceWith(['form-2018'], { relativeTo: route, replaceUrl: true });
  });

  it('keeps a 1996 project on form-2002', () => {
    const project1996 = { ...FULL_PROJECT, currentLegislationYear: 'legislation_1996', legislationYearList: [1996], legislation_1996: { name: 'Old Mine' } };
    const component = create('edit', { fullProject: [{ data: { searchResults: [project1996] } }] }, 'form-2002');

    expect(component.tabLinks.map(t => t.link)).toContain('form-2002');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('opens the current Act\'s tab on the bare edit URL of a project with older-Act data', () => {
    const project = { ...FULL_PROJECT, legislationYearList: [2002, 2018], legislation_2002: { name: 'Old Mine' } };
    const component = create('edit', { fullProject: [{ data: { searchResults: [project] } }] });

    expect(component.tabLinks.map(t => t.link)).toEqual(['form-2002', 'form-2018']);
    expect(navigate).toHaveBeenCalledOnceWith(['form-2018'], { relativeTo: route, replaceUrl: true });
  });

  it('moves the add page off the hidden form-2002 tab', () => {
    create('add', {}, 'form-2002');

    expect(navigate).toHaveBeenCalledOnceWith(['form-2018'], { relativeTo: route, replaceUrl: true });
  });
});
