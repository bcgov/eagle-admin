import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, ParamMap, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, isObservable, of } from 'rxjs';

import { AddEditProjectComponent } from './add-edit-project.component';
import { routes } from 'src/app/app-routing.module';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';

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
    route = <typeof route>{ url: of([{ path }]), data: isObservable(data) ? data : of(data), snapshot: { paramMap: convertToParamMap(path === 'edit' ? { projId: 'demi-7' } : {}), firstChild: tab ? { url: [{ path: tab }] } : null } };
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

  const WITH_DEMI_ID = { fullProject: [{ data: { searchResults: [{ ...FULL_PROJECT, legislation_2018: { name: 'Red Chris', demiId: 'demi-7' } }] } }] };

  it('lists the project\'s extensions and suspensions uncached, and Edit opens the picked one', () => {
    const data = new Subject<object>();
    create('edit', data);
    data.next(WITH_DEMI_ID);
    const suspension = { id: 's1', type: 'Suspension', appliedTo: 'Application', start: '2026-03-01', end: '2026-04-01' };
    const req = http.expectOne('/demi/api/projects/demi-7/extensions');
    expect(req.request.headers.get('cache-control')).toBe('no-cache');
    req.flush({ reviewExtensions: [{ id: 'e1', type: 'Extension', appliedTo: 'Review', start: '2026-01-01', end: '2026-02-01' }], reviewSuspensions: [suspension] });
    // The resolver answers again on a tab change; the lists are not read twice.
    data.next(WITH_DEMI_ID);
    http.expectNone('/demi/api/projects/demi-7/extensions');
    fixture.detectChanges();

    const rows: HTMLTableRowElement[] = Array.from(fixture.nativeElement.querySelectorAll('.extensions tbody tr'));
    expect(rows.map(row => row.cells[0].textContent)).toEqual(['Extension', 'Suspension']);
    rows[1].querySelector('button').click();

    expect(TestBed.inject(StorageService).state.extension).toEqual({ ...suspension, kind: 'Suspension', projectId: 'demi-7' });
    expect(navigate).toHaveBeenCalledWith(['/p', 'demi-7', 'edit', 'edit-suspension']);
  });

  it('drops a list read for a project the page has left', () => {
    const data = new Subject<object>();
    const component = create('edit', data);
    const forProject = (demiId: string) => ({ fullProject: [{ data: { searchResults: [{ ...FULL_PROJECT, legislation_2018: { name: demiId, demiId } }] } }] });
    data.next(forProject('demi-a'));
    const readA = http.expectOne('/demi/api/projects/demi-a/extensions');
    data.next(forProject('demi-b'));
    http.expectOne('/demi/api/projects/demi-b/extensions')
      .flush({ reviewExtensions: [{ id: 'b1', type: 'Extension', appliedTo: 'B', start: '2026-01-01', end: '2026-02-01' }], reviewSuspensions: [] });

    expect(readA.cancelled).toBeTrue();
    expect(component.extensions().map(item => item.id)).toEqual(['b1']);
  });

  it('a failed extension read says so instead of the empty text, and Try again reads again', () => {
    create('edit', WITH_DEMI_ID);
    http.expectOne('/demi/api/projects/demi-7/extensions').flush({ error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();

    const section: HTMLElement = fixture.nativeElement.querySelector('.extensions');
    expect(section.textContent).toContain('Could not load extensions.');
    expect(section.textContent).not.toContain('This project has no extensions or suspensions.');
    section.querySelector('button').click();
    http.expectOne('/demi/api/projects/demi-7/extensions').flush({ reviewExtensions: [], reviewSuspensions: [] });
    fixture.detectChanges();

    expect(section.textContent).toContain('This project has no extensions or suspensions.');
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

  it('the bare edit URL has no redirect, so the page opens the current Act\'s tab', () => {
    const edit = routes.find(r => r.path === 'p/:projId')!.children!.find(r => r.path === 'edit')!;

    expect(edit.children!.find(r => r.path === '')!.redirectTo).toBeUndefined();
  });

  it('moves the add page off the hidden form-2002 tab', () => {
    create('add', {}, 'form-2002');

    expect(navigate).toHaveBeenCalledOnceWith(['form-2018'], { relativeTo: route, replaceUrl: true });
  });
});
