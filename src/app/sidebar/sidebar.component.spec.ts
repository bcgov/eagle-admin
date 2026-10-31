import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { SideBarService } from '../services/sidebar.service';
import { StorageService } from '../services/storage.service';

@Component({ template: '' })
class BlankPageComponent {}

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let router: Router;

  beforeEach(async () => {
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['ensureListsLoaded']);
    Object.defineProperty(configServiceSpy, 'config', { value: signal({ ENVIRONMENT: 'dev' }) });

    const keycloakServiceSpy = jasmine.createSpyObj('KeycloakService', ['getUserRoles']);
    keycloakServiceSpy.getUserRoles.and.returnValue([]);

    const sideBarServiceSpy = jasmine.createSpyObj('SideBarService', [], {
      archiveChange: new BehaviorSubject<boolean>(false),
      toggleChange: new BehaviorSubject<boolean>(false),
    });

    const storageServiceSpy = jasmine.createSpyObj('StorageService', [], {
      state: { projectDocumentTableParams: null },
    });

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([{ path: '**', component: BlankPageComponent }]),
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: KeycloakService, useValue: keycloakServiceSpy },
        { provide: SideBarService, useValue: sideBarServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SidebarComponent);
  });

  async function visit(url: string): Promise<void> {
    await router.navigateByUrl(url);
    fixture.detectChanges();
  }

  function activeLinkIds(): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('a.active')).map(a => a.id);
  }

  it('highlights only the top-level item on a non-project page', async () => {
    await visit('/projects');

    expect(activeLinkIds()).toEqual(['allProjects']);
    expect(fixture.nativeElement.querySelector('#groups')).toBeNull();
  });

  it('highlights Comment Periods on a comment period detail page', async () => {
    await visit('/p/5c1a/cp/9f3e');

    expect(activeLinkIds()).toEqual(['comment-periods']);
  });

  it('highlights the project menu item named by the third segment, ignoring matrix params', async () => {
    await visit('/p/5c1a;tab=2/project-groups;pageSize=10');

    expect(activeLinkIds()).toEqual(['groups']);
    expect(fixture.nativeElement.querySelector('a.dropdown-btn').getAttribute('href')).toBe('/p/5c1a');
  });

  it('highlights the notification menu item named by the third URL segment on a /pn page', async () => {
    await visit('/pn/7b2c/project-notification-documents');

    expect(activeLinkIds()).toContain('pn-documents');
  });

  it('points the notification menu links at the /pn project id', async () => {
    await visit('/pn/7b2c/project-notification-documents');

    expect(fixture.nativeElement.querySelector('#pn-details').getAttribute('href')).toBe('/pn/7b2c/details');
  });
});
