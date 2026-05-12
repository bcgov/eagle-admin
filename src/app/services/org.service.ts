import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Org } from '../models/org';
import { map, catchError } from 'rxjs/operators';
import { LoadingStateService } from './loading-state.service';
import { ToastService } from './toast.service';
import { LoggingService } from './logging.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private api = inject(ApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  save(org: Org): Observable<Org> {
    return this.api.put<Org>(`organization/${org._id}`, org).pipe(
      catchError(error => {
        this.logger.error('Failed to save org', 'OrgService', error);
        this.toast.error('Failed to save organization.');
        return this.api.handleError(error);
      })
    );
  }

  add(org: Org): Observable<Org> {
    return this.api.post<Org>('organization/', org).pipe(
      catchError(error => {
        this.logger.error('Failed to add org', 'OrgService', error);
        this.toast.error('Failed to add organization.');
        return this.api.handleError(error);
      })
    );
  }

  getByCompanyType(type: string): Observable<Org[]> {
    const qs = `organization?companyType=${type}&sortBy=+name&fields=${this.api.buildValues(['name'])}`;
    return this.api.get<Org[]>(qs).pipe(
      withLoading(this.loadingState, `orgs-by-type-${type}`),
      map((res: any) => {
        if (res) {
          return res.map((org: any) => new Org(org));
        }
      }),
      catchError(error => {
        this.logger.error('Failed to load organizations', 'OrgService', error);
        this.toast.error('Failed to load organizations.');
        return this.api.handleError(error);
      })
    );
  }
}
