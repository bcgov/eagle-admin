import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { isEagleId } from '../models/demi/demi-ids';
import { Organization } from '../models/demi/organization';
import { DemiProject } from '../models/demi/project';
import { FullProject } from '../models/fullProject';
import { Org } from '../models/org';
import { SearchResults } from '../models/search';
import { DemiApiService } from '../services/demi-api.service';
import { LoggingService } from '../services/logging.service';
import { toEagleOrg } from '../services/org.service';
import { ProjectService } from '../services/project.service';
import { ToastService } from '../services/toast.service';

const LEGISLATION_KEY = /^legislation_\d{4}$/;

const asSearchResults = (searchResults: object[]) =>
  [new SearchResults({ data: { searchResults, meta: [{ searchResultsTotal: searchResults.length }] } })];

const blockKeys = (row: DemiProject) =>
  Object.keys(row).filter(key => LEGISLATION_KEY.test(key) && row[key] && typeof row[key] === 'object');

/** The Organization ids a row names: its `proponentId` and each legislation block's `proponent`. */
export function proponentIds(row: DemiProject): string[] {
  const blockIds = blockKeys(row).map(key => (row[key] as { proponent?: unknown }).proponent);
  return [...new Set([row.proponentId, ...blockIds].filter((id): id is string => typeof id === 'string' && id !== ''))];
}

/**
 * The eagle-api `projectLegislation=all&populate=true` shape, built from a DEMI row. `_id` is the Eagle id.
 * Each `proponent` id becomes its Organization; one DEMI does not have is left off, as eagle-api's lookup did.
 */
export function toFullProject(row: DemiProject, orgs: Map<string, Org>): FullProject {
  const project: Record<string, unknown> = { ...row, _id: row.eagleId ?? null };
  const proponent = row.proponentId ? orgs.get(row.proponentId) : undefined;
  if (proponent) {
    project.proponent = proponent;
  }
  for (const key of blockKeys(row)) {
    const { proponent: id, ...block } = row[key] as Record<string, unknown>;
    const org = typeof id === 'string' ? orgs.get(id) : id;
    project[key] = org ? { ...block, proponent: org } : block;
  }
  return project as unknown as FullProject;
}

/**
 * Every legislation version of the project (`legislation_<year>`), from DEMI, for the detail, archived-detail
 * and edit screens. Keeps eagle-api's search result shape, which those screens read.
 */
export const fullProjectResolver: ResolveFn<object> = (route: ActivatedRouteSnapshot) => {
  const demiApi = inject(DemiApiService);
  const projectService = inject(ProjectService);
  const logger = inject(LoggingService);
  const toast = inject(ToastService);

  const projId = route.pathFromRoot.find(r => r.paramMap.has('projId'))?.paramMap.get('projId') ?? '';
  // Track-only projects arrive by DEMI id and hold no Eagle legislation blocks.
  if (!isEagleId(projId)) {
    return of(asSearchResults([]));
  }

  return projectService.getNative(projId).pipe(
    mergeMap(row => {
      // A row Eagle has not pushed since DEMI began storing every block has none of them.
      if (!Array.isArray(row.legislationYearList)) {
        throw new Error(`Project ${projId} has no legislation blocks in DEMI`);
      }
      return demiApi.byIds<Organization>('organizations', proponentIds(row)).pipe(
        map(orgs => toFullProject(row, new Map<string, Org>(orgs.map(org => [org.id, toEagleOrg(org)]))))
      );
    }),
    map(project => asSearchResults([project])),
    catchError(error => {
      logger.error('Failed to load project', 'fullProjectResolver', error);
      toast.error('Failed to load project.');
      return of(asSearchResults([]));
    }),
    mergeMap(data => projectService.getPeopleObjs(data))
  );
};
