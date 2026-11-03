import { Injectable, inject } from '@angular/core';
import { DemiApiService } from './demi-api.service';
import { EMPTY, Observable, of } from 'rxjs';
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

// DEMI's organization POST and PUT take only these; any other key is a 400 except
// `read` and `isPublished`, which PUT drops.
const WRITABLE_FIELDS = [
  'name', 'description', 'country', 'postal', 'province', 'city', 'address1', 'address2',
  'companyType', 'companyLegal', 'company', 'parentCompany'
] as const;

function writeBody(org: Partial<Organization>): Partial<Organization> {
  return Object.fromEntries(WRITABLE_FIELDS.filter(key => key in org).map(key => [key, org[key]]));
}

/** The legacy `Org` a DEMI organization row maps to. */
export function toEagleOrg(row: Partial<Organization>): Org {
  return new Org({ ...row, _id: row.id ?? null });
}

@Injectable({ providedIn: 'root' })
export class OrgService {
  private demiApi = inject(DemiApiService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  /**
   * Writes `org` to the DEMI row `org.id`; publish state is not set here.
   * A refused save shows DEMI's message and completes with no value, so the form stays open.
   */
  save(org: Partial<Organization>): Observable<Organization> {
    return this.demiApi.update<Organization>('organizations', org.id, writeBody(org)).pipe(
      catchError(error => this.writeFailed('save', error))
    );
  }

  /** Creates a published organization; DEMI's default is unpublished. Fails as `save` does. */
  add(org: Partial<Organization>): Observable<Organization> {
    return this.demiApi.create<Organization>('organizations', { ...writeBody(org), isPublished: true }).pipe(
      catchError(error => this.writeFailed('add', error))
    );
  }

  private writeFailed(action: 'save' | 'add', error: Error): Observable<never> {
    this.logger.error(`Failed to ${action} org`, 'OrgService', error);
    this.toast.error(`Failed to ${action} organization. ${error.message}`);
    return EMPTY;
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
