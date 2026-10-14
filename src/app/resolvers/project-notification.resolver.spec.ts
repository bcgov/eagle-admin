import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';

import { projectNotificationResolver } from './project-notification.resolver';
import { NotificationProjectService } from '../services/notification-project.service';
import { StorageService } from '../services/storage.service';
import { DemiNotification, LegacyNotification } from '../models/demi/notification';

describe('projectNotificationResolver', () => {
  let service: jasmine.SpyObj<NotificationProjectService>;
  let storage: { state: Record<string, any> };

  beforeEach(() => {
    service = jasmine.createSpyObj<NotificationProjectService>('NotificationProjectService', ['getNative']);
    storage = { state: {} };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: NotificationProjectService, useValue: service },
        { provide: StorageService, useValue: storage }
      ]
    });
  });

  function resolve(id: string): Promise<LegacyNotification | RedirectCommand> {
    const route = { paramMap: convertToParamMap({ notificationProjectId: id }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => projectNotificationResolver(route, null));
    return firstValueFrom(result as Observable<LegacyNotification | RedirectCommand>);
  }

  it('returns and stores the notification keyed on the Eagle id', async () => {
    service.getNative.and.returnValue(of({ id: 'e1', eagleId: 'e1', name: 'Notice', isPublished: true } as DemiNotification));

    const notification = await resolve('e1') as LegacyNotification;

    expect(service.getNative).toHaveBeenCalledWith('e1');
    expect(notification._id).toBe('e1');
    expect(notification.read).toEqual(['public']);
    expect(storage.state['currentProject'].data).toBe(notification);
  });

  it('redirects to search when the notification cannot be read', async () => {
    service.getNative.and.returnValue(of(null));

    expect(await resolve('missing')).toEqual(jasmine.any(RedirectCommand));
  });
});
