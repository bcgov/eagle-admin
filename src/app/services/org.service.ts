import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import { DemiApiService } from './demi-api.service';
import { Observable, of } from 'rxjs';
import { Org } from '../models/org';
import { Organization } from '../models/demi/organization';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { map, catchError } from 'rxjs/operators';
import { LoadingStateService } from './loading-state.service';
import { ToastService } from './toast.service';
import { LoggingService } from './logging.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

/** Loading-state key for {@link OrgService.listOrganizations}. */
export const ORG_LIST_LOADING = 'orgs-list';

/** DEMI sorts organizations on `name` only, so any other table sort falls back to name ascending. */
export function orgSort(sortBy: string | null | undefined): string {
  return sortBy === '-name' ? '-name' : 'name';
}

/**
 * Eagle write body for an organization. A body with `_id` is already Eagle-shaped and goes unchanged;
 * native input (`id` or, for a new row, no id at all) is converted. Temporary until writes move off eagle-api.
 */
export function toEagleOrg(body: Org | Partial<Organization>): Org {
  if ('_id' in body) {
    return body as Org;
  }
  return new Org({ ...body, _id: body.id ?? null });
}

@Injectable({ providedIn: 'root' })
export class OrgService {
  private api = inject(ApiService);
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  save(input: Org | Partial<Organization>): Observable<Org> {
    const org = toEagleOrg(input);
    return this.api.put<Org>(`organization/${org._id}`, org).pipe(
      catchError(error => {
        this.logger.error('Failed to save org', 'OrgService', error);
        this.toast.error('Failed to save organization.');
        return this.api.handleError(error);
      })
    );
  }

  add(org: Org | Partial<Organization>): Observable<Org> {
    return this.api.post<Org>('organization/', toEagleOrg(org)).pipe(
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

  /**
   * One page of organizations from DEMI. Filters: `companyType`; sort: `name` only.
   * A failed read shows an error and yields an empty page, so table route subscriptions stay alive.
   */
  listOrganizations(params: DemiListParams): Observable<DemiList<Organization>> {
    return this.demiApi.list<Organization>('organizations', params).pipe(
      withLoading(this.loadingState, ORG_LIST_LOADING),
      catchError(error => {
        this.logger.error('Failed to load organizations', 'OrgService', error);
        this.toast.error('Failed to load organizations.');
        return of({ rows: [], total: 0 });
      })
    );
  }

  /** One organization from DEMI. Errors pass through untoasted: some callers can carry on without the row. */
  getOrganization(id: string): Observable<Organization> {
    return this.demiApi.get<Organization>('organizations', id).pipe(
      withLoading(this.loadingState, `org-${id}`)
    );
  }
}
