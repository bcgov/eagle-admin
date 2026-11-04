import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';

import { ProjectNotificationDetailComponent } from './project-notification-detail.component';
import { DemiNotification, LegacyNotification } from 'src/app/models/demi/notification';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

const NOTIFICATION = { _id: 'pn-eagle-1', demiId: 'pn-demi-1', name: 'Lynn Valley Coal Mine PN', centroid: [], read: ['staff'] } as LegacyNotification;
const ROW = { id: 'pn-demi-1', eagleId: 'pn-eagle-1', name: 'Lynn Valley Coal Mine PN', centroid: [] } as DemiNotification;

// Native rows from DEMI: one with an Eagle record, one with none.
const LINKED = { id: 'demi-doc-1', eagleId: 'eagle-doc-1', projectEagleId: 'pn-eagle-1', displayName: 'Letter' };
const UNLINKED = { id: 'demi-doc-2', displayName: 'No Eagle record' };

describe('ProjectNotificationDetailComponent', () => {
  let fixture: ComponentFixture<ProjectNotificationDetailComponent>;
  let component: ProjectNotificationDetailComponent;
  let documents: jasmine.SpyObj<DocumentService>;
  let notifications: jasmine.SpyObj<NotificationProjectService>;
  let storage: { state: any };
  let toast: jasmine.SpyObj<ToastService>;

  function create(notification: LegacyNotification | null = NOTIFICATION) {
    storage.state = { currentProject: notification ? { type: 'currentProjectNotification', data: notification } : null };
    fixture = TestBed.createComponent(ProjectNotificationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    documents = jasmine.createSpyObj('DocumentService', ['listNative', 'publish', 'unPublish', 'downloadNative']);
    documents.listNative.and.returnValue(of({ rows: [LINKED, UNLINKED] as any[], total: 2 }));
    documents.publish.and.returnValue(of({} as any));
    documents.unPublish.and.returnValue(of({} as any));
    notifications = jasmine.createSpyObj('NotificationProjectService', ['publish', 'unpublish']);
    notifications.publish.and.returnValue(of({ ...ROW, isPublished: true, read: ['staff', 'public'] }));
    notifications.unpublish.and.returnValue(of({ ...ROW, isPublished: false, read: ['staff'] }));
    storage = { state: {} };
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);

    TestBed.configureTestingModule({
      imports: [ProjectNotificationDetailComponent],
      providers: [
        provideRouter([]),
        { provide: DocumentService, useValue: documents },
        { provide: NotificationProjectService, useValue: notifications },
        { provide: StorageService, useValue: storage },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error']) }
      ]
    });
  });

  it('reads the notification documents from DEMI by notification id, newest first', () => {
    create();

    expect(documents.listNative).toHaveBeenCalledOnceWith({
      pageSize: 100,
      sort: '-datePosted',
      filters: { project: 'pn-eagle-1', documentSource: 'PROJECT-NOTIFICATION' } as any
    });
    expect(component.documents.map(d => d._id)).toEqual(['eagle-doc-1', null]);
    expect(component.loading).toBeFalse();
  });

  it('publishes only documents with an Eagle record, and the notification by its DEMI id', () => {
    create();

    component.publish();

    expect(documents.publish).toHaveBeenCalledOnceWith('eagle-doc-1');
    expect(notifications.publish).toHaveBeenCalledOnceWith('pn-demi-1');
    expect(component.isPublished).toBeTrue();
    expect(storage.state.currentProject.data.read).toContain('public');
  });

  it('keeps the badge and publishes no document when DEMI refuses the publish', () => {
    notifications.publish.and.returnValue(EMPTY);
    create();

    component.publish();

    expect(documents.publish).not.toHaveBeenCalled();
    expect(component.isPublished).toBeFalse();
    expect(component.loading).toBeFalse();
  });

  it('shows the notification published and toasts when a document publish fails', () => {
    documents.publish.and.returnValue(throwError(() => new Error('Document is locked')));
    create();

    component.publish();

    expect(component.isPublished).toBeTrue();
    expect(storage.state.currentProject.data.read).toContain('public');
    expect(toast.error).toHaveBeenCalledOnceWith('The notification was published, but its documents were not. Document is locked');
    expect(component.loading).toBeFalse();
  });

  it('unpublishes only documents with an Eagle record, and the notification by its DEMI id', () => {
    create({ ...NOTIFICATION, read: ['staff', 'public'] });
    expect(component.isPublished).toBeTrue();

    component.unPublish();

    expect(documents.unPublish).toHaveBeenCalledOnceWith('eagle-doc-1');
    expect(notifications.unpublish).toHaveBeenCalledOnceWith('pn-demi-1');
    expect(component.isPublished).toBeFalse();
  });

  it('goes back to the list when no notification is loaded', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    create(null);

    expect(navigate).toHaveBeenCalledWith(['/project-notifications']);
    expect(documents.listNative).not.toHaveBeenCalled();
  });
});
