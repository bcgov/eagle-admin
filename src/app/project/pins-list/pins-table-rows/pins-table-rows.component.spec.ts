import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectService } from 'src/app/services/project.service';
import { ToastService } from 'src/app/services/toast.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { PinsTableRowsComponent } from './pins-table-rows.component';

describe('PinsTableRowsComponent', () => {
  let fixture: ComponentFixture<PinsTableRowsComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    projectService = jasmine.createSpyObj('ProjectService', ['deletePin']);
    projectService.deletePin.and.returnValue(of({} as any));
    toast = jasmine.createSpyObj('ToastService', ['error']);
    const modal = jasmine.createSpyObj('NgbModal', ['open']);
    modal.open.and.returnValue({ componentInstance: {}, result: Promise.resolve(true) });
    TestBed.configureTestingModule({
      imports: [PinsTableRowsComponent],
      providers: [
        provideRouter([]),
        { provide: NgbModal, useValue: modal },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(PinsTableRowsComponent);
    const rows = [{ _id: 'org-1', name: 'Tsawout', province: 'BC' }];
    fixture.componentRef.setInput('data', new TableObject(PinsTableRowsComponent, rows, {}, { projectId: 'eagle-1', pinsProjectId: 'demi-7' }));
    fixture.componentRef.setInput('columnData', [{ width: '65%' }, { width: '25%' }, { width: '10%' }]);
    fixture.componentRef.setInput('smallTable', false);
    fixture.detectChanges();
  });

  const clickRemove = () => (fixture.nativeElement.querySelector('td[data-label="Select"]') as HTMLElement).click();

  it('removes the pin from the DEMI project once confirmed', async () => {
    clickRemove();
    await fixture.whenStable();
    expect(projectService.deletePin).toHaveBeenCalledWith('demi-7', 'org-1');
  });

  it('shows DEMI\'s message when the removal is refused', async () => {
    projectService.deletePin.and.returnValue(throwError(() => new Error('Forbidden. Requires one of the roles sysadmin.')));
    clickRemove();
    await fixture.whenStable();
    expect(toast.error).toHaveBeenCalledWith('Forbidden. Requires one of the roles sysadmin.');
  });
});
