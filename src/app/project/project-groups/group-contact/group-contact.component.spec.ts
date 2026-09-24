import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { GroupContactComponent } from './group-contact.component';
import { ExcelService } from 'src/app/services/excel.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';

describe('GroupContactComponent paging from URL', () => {
  let component: GroupContactComponent;
  let getGroupMembers: jasmine.Spy;

  beforeEach(() => {
    getGroupMembers = jasmine.createSpy('getGroupMembers')
      .and.returnValue(of([{ total_items: 60, results: [{ _id: 'u1', displayName: 'A' }] }]));
    const urlParams = { groupId: 'g1', currentPage: '3', pageSize: '25', sortBy: '-email' };
    TestBed.configureTestingModule({
      imports: [GroupContactComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap(urlParams)),
            snapshot: { params: urlParams, paramMap: convertToParamMap(urlParams) },
            parent: { snapshot: { paramMap: convertToParamMap({ projId: 'p1' }) } }
          }
        },
        { provide: ProjectService, useValue: { getGroupMembers } },
        {
          provide: SearchService,
          useValue: { getSearchResults: () => of([{ data: { meta: [{}], searchResults: [{ _id: 'g1', name: 'Group' }] } }]) }
        },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1' }, state: {} } },
        { provide: NgbModal, useValue: {} },
        { provide: ExcelService, useValue: {} },
        { provide: NavigationStackUtils, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    // No detectChanges: the load runs from ngOnInit and needs no rendered template.
    component = TestBed.createComponent(GroupContactComponent).componentInstance;
    component.ngOnInit();
  });

  it('requests the page, page size and sort from the URL', () => {
    expect(getGroupMembers).toHaveBeenCalledWith('p1', 'g1', 3, 25, '-email');
  });

  it('hands the URL page to the table', () => {
    expect(component.tableData.paginationData.currentPage).toBe(3);
  });

  it('keeps the URL page size in the table after the load', () => {
    expect(component.tableData.paginationData.pageSize).toBe(25);
  });
});
