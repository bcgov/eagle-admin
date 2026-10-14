import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProjectNotificationDetailComponent } from './project-notification-detail.component';
import { LegacyNotification } from 'src/app/models/demi/notification';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { StorageService } from 'src/app/services/storage.service';

const NOTIFICATION = { _id: 'pn-eagle-1', name: 'Lynn Valley Coal Mine PN', centroid: [], read: ['staff'] } as LegacyNotification;

// Native rows from DEMI: one with an Eagle record, one with none.
const LINKED = { id: 'demi-doc-1', eagleId: 'eagle-doc-1', projectEagleId: 'pn-eagle-1', displayName: 'Letter' };
const UNLINKED = { id: 'demi-doc-2', displayName: 'No Eagle record' };

describe('ProjectNotificationDetailComponent', () => {
  let fixture: ComponentFixture<ProjectNotificationDetailComponent>;
  let component: ProjectNotificationDetailComponent;
  let documents: jasmine.SpyObj<DocumentService>;
  let notifications: jasmine.SpyObj<NotificationProjectService>;
  let storage: { state: any };

  function create(notification: LegacyNotification | null = NOTIFICATION) {
    storage.state = { currentProject: notification ? { type: 'currentProjectNotification', data: notification } : null };
    fixture = TestBed.createComponent(ProjectNotificationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    documents = jasmine.createSpyObj('DocumentService', ['listNative', 'publish', 'unPublish', 'downloadDocument']);
    documents.listNative.and.returnValue(of({ rows: [LINKED, UNLINKED] as any[], total: 2 }));
    documents.publish.and.returnValue(of({} as any));
    documents.unPublish.and.returnValue(of({} as any));
    notifications = jasmine.createSpyObj('NotificationProjectService', ['save']);
    notifications.save.and.returnValue(of({} as any));
    storage = { state: {} };

    TestBed.configureTestingModule({
      imports: [ProjectNotificationDetailComponent],
      providers: [
        provideRouter([]),
        { provide: DocumentService, useValue: documents },
        { provide: NotificationProjectService, useValue: notifications },
        { provide: StorageService, useValue: storage },
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

  it('publishes only documents with an Eagle record, then the notification', () => {
    create();

    component.publish();

    expect(documents.publish).toHaveBeenCalledOnceWith('eagle-doc-1');
    expect(notifications.save).toHaveBeenCalledOnceWith(NOTIFICATION, true);
    expect(component.isPublished).toBeTrue();
  });

  it('unpublishes only documents with an Eagle record, then the notification', () => {
    create({ ...NOTIFICATION, read: ['staff', 'public'] });
    expect(component.isPublished).toBeTrue();

    component.unPublish();

    expect(documents.unPublish).toHaveBeenCalledOnceWith('eagle-doc-1');
    expect(notifications.save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: 'pn-eagle-1' }), false);
    expect(component.isPublished).toBeFalse();
  });

  it('goes back to the list when no notification is loaded', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    create(null);

    expect(navigate).toHaveBeenCalledWith(['/project-notifications']);
    expect(documents.listNative).not.toHaveBeenCalled();
  });
});
