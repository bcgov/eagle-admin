import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { ProjectArchivedDetailComponent } from './project-archived-detail.component';

describe('ProjectArchivedDetailComponent', () => {
  let fixture: ComponentFixture<ProjectArchivedDetailComponent>;
  let navigate: jasmine.Spy;

  function open(fullProject: unknown) {
    TestBed.configureTestingModule({
      imports: [ProjectArchivedDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { fullProject } },
            parent: { snapshot: { paramMap: convertToParamMap({ projId: 'eagle-1' }) } }
          }
        }
      ]
    });
    TestBed.inject(StorageService).state.currentProject = { data: { _id: 'eagle-1', name: 'Copper Mine' } };
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ProjectArchivedDetailComponent);
    fixture.detectChanges();
  }

  const searchRow = (row: object) => [{ data: { searchResults: [row] } }];

  it('shows the 2002 block from the resolved project', () => {
    open(searchRow({
      isPublished: true,
      legislationYearList: [2002, 2018],
      legislation_2002: { name: 'Copper Mine', legislationYear: 2002, centroid: [-127, 54] },
      legislation_1996: { name: 'Old Name', legislationYear: 1996, centroid: [-127, 54] }
    }));
    expect(fixture.componentInstance.project.name).toBe('Copper Mine');
    expect(fixture.componentInstance.project._id).toBe('eagle-1');
    expect(fixture.componentInstance.isPublished).toBeTrue();
  });

  it('falls back to the 1996 block when there is no 2002 one', () => {
    open(searchRow({ legislationYearList: [1996, 2018], legislation_1996: { name: 'Old Name', legislationYear: 1996, centroid: [-127, 54] } }));
    expect(fixture.componentInstance.project.name).toBe('Old Name');
    expect(fixture.componentInstance.isPublished).toBeFalse();
  });

  it('goes back to search when the resolver found nothing', () => {
    spyOn(window, 'alert');
    open([{ data: { searchResults: [] } }]);
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });
});
