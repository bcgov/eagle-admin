import { Injectable, inject } from '@angular/core';
import { DemiApiService } from './demi-api.service';
import { Observable, of, throwError } from 'rxjs';
import { Org } from '../models/org';
import { Organization } from '../models/demi/organization';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { catchError } from 'rxjs/operators';
import { LoadingStateService } from './loading-state.service';
import { ToastService } from './toast.service';
import { LoggingService } from './logging.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

/** Loading-state key for {@link OrgService.listOrganizations}. */
export const ORG_LIST_LOADING = 'orgs-list';

/** Fields DEMI's organization POST and PUT accept; anything else in the body is a 400. */
const WRITABLE_FIELDS = [
  'name', 'description', 'country', 'postal', 'province', 'city', 'address1', 'address2',
  'companyType', 'companyLegal', 'company', 'parentCompany'
] as const;

function writeBody(org: Partial<Organization>): Partial<Organization> {
  return Object.fromEntries(WRITABLE_FIELDS.filter(key => key in org).map(key => [key, org[key]]));
}

/** Eagle-shaped organization. A body with `_id` goes unchanged; native input (`id`, or no id) is converted. */
export function toEagleOrg(body: Org | Partial<Organization>): Org {
  if ('_id' in body) {
    return body as Org;
  }
  return new Org({ ...body, _id: body.id ?? null });
}

@Injectable({ providedIn: 'root' })
export class OrgService {
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /** Writes `org` to the DEMI row `org.id`. Visibility is not set here: DEMI moves it only by publish. */
  save(org: Partial<Organization>): Observable<Organization> {
    return this.demiApi.update<Organization>('organizations', org.id, writeBody(org)).pipe(
      catchError(error => {
        this.logger.error('Failed to save org', 'OrgService', error);
        this.toast.error('Failed to save organization.');
        return throwError(() => error);
      })
    );
  }

  /** eagle-api published every new organization; DEMI defaults to unpublished, so this asks for published. */
  add(org: Partial<Organization>): Observable<Organization> {
    return this.demiApi.create<Organization>('organizations', { ...writeBody(org), isPublished: true }).pipe(
      catchError(error => {
        this.logger.error('Failed to add org', 'OrgService', error);
        this.toast.error('Failed to add organization.');
        return throwError(() => error);
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
