import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { DemiProject } from 'src/app/models/demi/project';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { PinsListComponent } from './pins-list.component';

describe('PinsListComponent', () => {
  let fixture: ComponentFixture<PinsListComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let params: BehaviorSubject<Params>;

  const row = (overrides: Partial<DemiProject> = {}): DemiProject => ({
    id: 'demi-7',
    eagleId: 'eagle-1',
    name: 'Mine',
    pins: [
      { _id: 'o1', name: 'Tsawout', province: 'BC' },
      { _id: 'o2', name: 'Alkali Lake', province: 'AB' },
      { _id: 'o3', name: 'Musqueam', province: 'BC' }
    ],
    ...overrides
  });

  function open(resolved: DemiProject, urlParams: Params = {}) {
    params = new BehaviorSubject(urlParams);
    projectService = jasmine.createSpyObj('ProjectService', ['getNative', 'addPins', 'publishPins', 'unpublishPins', 'deletePin']);
    TestBed.configureTestingModule({
      imports: [PinsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params,
            data: of({ contacts: resolved }),
            snapshot: {},
            parent: { snapshot: { paramMap: convertToParamMap({ projId: 'eagle-1' }) } }
          }
        },
        { provide: ProjectService, useValue: projectService },
        // The project resolver stores the legacy project: `_id` is the Eagle id, `demiId` the DEMI id.
        { provide: StorageService, useValue: { state: {}, currentProjectData: { _id: 'eagle-1', demiId: 'demi-7', name: 'Mine' } } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'warn', 'error', 'info']) }
      ]
    });
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    fixture = TestBed.createComponent(PinsListComponent);
    fixture.detectChanges();
  }

  const shownNames = () => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('td[data-label="Name"]'))
    .map(cell => cell.textContent!.trim());
  const publishButton = () => fixture.nativeElement.querySelector('#button-sa') as HTMLButtonElement;

  it('lists the pins from the project row by name A to Z', () => {
    open(row());
    expect(shownNames()).toEqual(['Alkali Lake', 'Musqueam', 'Tsawout']);
  });

  it('sorts by the URL sort', () => {
    open(row(), { sortBy: '-name' });
    expect(shownNames()).toEqual(['Tsawout', 'Musqueam', 'Alkali Lake']);
  });

  it('shows the requested page and counts every pin', () => {
    open(row(), { sortBy: '+name', currentPage: '2', pageSize: '2' });
    expect(shownNames()).toEqual(['Tsawout']);
    expect(fixture.componentInstance.tableParams.totalListItems).toBe(3);
  });

  it('says so when the project has no pins', () => {
    open(row({ pins: undefined }));
    expect(fixture.nativeElement.textContent).toContain('No Participating Indigenous Nations found.');
  });

  it('offers Unpublish when the row says the pins are published', () => {
    open(row({ pinsPublished: true }));
    expect(publishButton().textContent!.trim()).toBe('Unpublish');
  });

  it('offers Publish when the row says the pins are not published', () => {
    open(row({ pinsPublished: false }));
    expect(publishButton().textContent!.trim()).toBe('Publish');
  });

  it('hands the rows the Eagle id for links and the DEMI id for unpinning', () => {
    open(row());
    expect(fixture.componentInstance.tableData.extraData).toEqual({ projectId: 'eagle-1', pinsProjectId: 'demi-7' });
  });

  it('publishes the pins on the DEMI project id and shows the row DEMI returns', () => {
    open(row({ pinsPublished: false }));
    projectService.publishPins.and.returnValue(of(row({ pinsPublished: true })));
    publishButton().click();
    fixture.detectChanges();
    expect(projectService.publishPins).toHaveBeenCalledWith('demi-7');
    expect(publishButton().textContent!.trim()).toBe('Unpublish');
  });

  it('shows DEMI\'s message when it refuses to publish', () => {
    open(row({ pinsPublished: false }));
    const toastError = spyOn(TestBed.inject(ToastService), 'error');
    projectService.publishPins.and.returnValue(throwError(() => new Error('Organizations not published: o2')));
    publishButton().click();
    fixture.detectChanges();
    expect(toastError).toHaveBeenCalledWith('Organizations not published: o2');
  });

  it('shows DEMI\'s message when it refuses to add pins', () => {
    open(row());
    const toastError = spyOn(TestBed.inject(ToastService), 'error');
    projectService.addPins.and.returnValue(throwError(() => new Error('Organizations not published: o9')));
    const component = fixture.componentInstance;
    component.add([{ _id: 'o9' }], component);
    expect(projectService.addPins).toHaveBeenCalledWith('demi-7', ['o9']);
    expect(toastError).toHaveBeenCalledWith('Organizations not published: o9');
  });

  it('reads the row again after an add or remove changes the URL', () => {
    open(row());
    projectService.getNative.and.returnValue(of(row({ pins: [{ _id: 'o9', name: 'Kwikwetlem', province: 'BC' }] })));
    params.next({ ms: '1' });
    fixture.detectChanges();
    expect(projectService.getNative).toHaveBeenCalledWith('eagle-1');
    expect(shownNames()).toEqual(['Kwikwetlem']);
  });
});
