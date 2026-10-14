import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { PinsTableRowsComponent } from './pins-table-rows.component';

describe('PinsTableRowsComponent', () => {
  let fixture: ComponentFixture<PinsTableRowsComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;

  beforeEach(() => {
    projectService = jasmine.createSpyObj('ProjectService', ['deletePin']);
    projectService.deletePin.and.returnValue(of({} as any));
    const modal = jasmine.createSpyObj('NgbModal', ['open']);
    modal.open.and.returnValue({ componentInstance: {}, result: Promise.resolve(true) });
    TestBed.configureTestingModule({
      imports: [PinsTableRowsComponent],
      providers: [
        provideRouter([]),
        { provide: NgbModal, useValue: modal },
        { provide: ProjectService, useValue: projectService },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(PinsTableRowsComponent);
    const rows = [{ _id: 'org-1', name: 'Tsawout', province: 'BC' }];
    fixture.componentRef.setInput('data', new TableObject(PinsTableRowsComponent, rows, {}, { projectId: 'eagle-1' }));
    fixture.componentRef.setInput('columnData', [{ width: '65%' }, { width: '25%' }, { width: '10%' }]);
    fixture.componentRef.setInput('smallTable', false);
    fixture.detectChanges();
  });

  it('removes the pin from the Eagle project once confirmed', async () => {
    (fixture.nativeElement.querySelector('td[data-label="Select"]') as HTMLElement).click();
    await fixture.whenStable();
    expect(projectService.deletePin).toHaveBeenCalledWith('eagle-1', 'org-1');
  });
});
