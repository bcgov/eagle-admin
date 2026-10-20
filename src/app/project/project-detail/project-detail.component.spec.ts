import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DemiProject } from 'src/app/models/demi/project';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { SideBarService } from 'src/app/services/sidebar.service';
import { StorageService } from 'src/app/services/storage.service';
import { ProjectDetailComponent } from './project-detail.component';

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let navigate: jasmine.Spy;

  const row = (overrides: Partial<DemiProject> = {}): DemiProject => ({
    id: 'demi-7',
    eagleId: 'eagle-1',
    name: 'Copper Mine',
    legislationYear: 2018,
    isPublished: true,
    projectState: 'Active',
    address: 'Near Smithers',
    responsibleEPDId: 'epd-1',
    projectLeadId: 'lead-1',
    ...overrides
  });

  function open(native: DemiProject | Error, legislationYearList = [2018]) {
    projectService = jasmine.createSpyObj('ProjectService', ['getNative', 'getUsers', 'getCommentPeriods']);
    projectService.getNative.and.returnValue(native instanceof Error ? throwError(() => native) : of(native));
    projectService.getUsers.and.returnValue(of([
      { id: 'lead-1', displayName: 'Lee Lead', email: 'lee@example.com' },
      { id: 'epd-1', displayName: 'Erin Director', email: 'erin@example.com' }
    ] as any));
    projectService.getCommentPeriods.and.returnValue(of({ rows: [] }));
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            // fullProjectResolver supplies the legislation years in the eagle-api search shape.
            snapshot: { data: { fullProject: [{ data: { searchResults: [{ legislationYearList }] } }] } },
            parent: { snapshot: { paramMap: convertToParamMap({ projId: 'eagle-1' }) } }
          }
        },
        { provide: ProjectService, useValue: projectService },
        { provide: SideBarService, useValue: jasmine.createSpyObj('SideBarService', ['showArchive', 'hideArchive']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ProjectDetailComponent);
    fixture.detectChanges();
  }

  const text = (selector: string) => (fixture.nativeElement.querySelector(selector) as HTMLElement)?.textContent?.trim();

  it('reads the project from DEMI by the route id', () => {
    open(row());
    expect(projectService.getNative).toHaveBeenCalledWith('eagle-1');
    expect(text('#name')).toContain('Copper Mine');
  });

  it('reads the comment periods by the DEMI project id, newest first', () => {
    open(row());
    expect(projectService.getCommentPeriods).toHaveBeenCalledWith('demi-7', { sort: '-dateStarted', pageSize: 100 });
  });

  it('shows the lead and director read from DEMI users', () => {
    open(row());
    expect(projectService.getUsers).toHaveBeenCalledWith(['epd-1', 'lead-1']);
    expect(fixture.nativeElement.textContent).toContain('Lee Lead');
    expect(fixture.nativeElement.textContent).toContain('Erin Director');
  });

  it('shows the DEMI projectState as the project status and address as the location', () => {
    open(row());
    expect(text('#eac-status')).toBe('Active');
    expect(text('#location')).toBe('Near Smithers');
  });

  it('shows the published badge from the row', () => {
    open(row({ isPublished: true }));
    expect(fixture.nativeElement.querySelector('.badge-published')).not.toBeNull();
  });

  it('shows not published when the row is not published', () => {
    open(row({ isPublished: false }));
    expect(fixture.nativeElement.querySelector('.badge-unpublished')).not.toBeNull();
  });

  it('shows the legislation year from the row', () => {
    open(row({ legislationYear: 2002 }), [2002]);
    expect(text('#legislation')).toBe('2002 Environmental Assessment Act');
  });

  it('offers the archived details when an older legislation year exists', () => {
    open(row(), [2002, 2018]);
    expect(fixture.nativeElement.textContent).toContain('View Archived Project Details');
  });

  it('stores the legacy project under its Eagle id with the DEMI id beside it', () => {
    open(row());
    const stored = TestBed.inject(StorageService).currentProjectData;
    expect(stored._id).toBe('eagle-1');
    expect(stored.demiId).toBe('demi-7');
  });

  it('goes back to search when the project cannot be read', () => {
    spyOn(window, 'alert');
    open(new Error('Project not found'));
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });
});
