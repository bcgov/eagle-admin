import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Organization } from '../models/demi/organization';
import { DemiProject } from '../models/demi/project';
import { toLegacyProject } from '../models/demi/project-legacy';
import { FullProject } from '../models/fullProject';
import { Org } from '../models/org';
import { SearchResults } from '../models/search';
import { DemiApiService } from '../services/demi-api.service';
import { LoggingService } from '../services/logging.service';
import { toEagleOrg } from '../services/org.service';
import { ProjectService, actYear } from '../services/project.service';
import { ToastService } from '../services/toast.service';

const LEGISLATION_KEY = /^legislation_\d{4}$/;

const asSearchResults = (searchResults: object[]) =>
  [new SearchResults({ data: { searchResults, meta: [{ searchResultsTotal: searchResults.length }] } })];

const blockKeys = (row: DemiProject) =>
  Object.keys(row).filter(key => LEGISLATION_KEY.test(key) && row[key] && typeof row[key] === 'object');

/** The project's Act; a row that names none, such as a Track-only one, is a 2018 Act project. */
const currentYear = (row: DemiProject) => actYear(row) ?? 2018;

/** The Organization ids a row names: its `proponentId` and each older-Act block's `proponent`. */
function proponentIds(row: DemiProject): string[] {
  const currentKey = `legislation_${currentYear(row)}`;
  const blockIds = blockKeys(row).filter(key => key !== currentKey).map(key => (row[key] as { proponent?: unknown }).proponent);
  return [...new Set([row.proponentId, ...blockIds].filter((id): id is string => typeof id === 'string' && id !== ''))];
}

/**
 * eagle-api's `projectLegislation=all&populate=true` shape from a DEMI row; `_id` is the Eagle id. The current Act's block is
 * the top level, since DEMI's PUT writes only there. Proponent ids become Organizations; unknown ones are left off, as eagle-api did.
 */
function toFullProject(row: DemiProject, orgs: Map<string, Org>): FullProject {
  const year = currentYear(row);
  const currentKey = `legislation_${year}`;
  const stored = Array.isArray(row.legislationYearList) ? row.legislationYearList.map(Number) : [];
  const project: Record<string, unknown> = {
    ...row,
    _id: row.eagleId ?? null,
    currentLegislationYear: currentKey,
    legislationYearList: [...new Set([...stored, year])].sort((a, b) => a - b)
  };
  const proponent = row.proponentId ? orgs.get(row.proponentId) : undefined;
  if (proponent) {
    project.proponent = proponent;
  }
  for (const key of blockKeys(row).filter(key => key !== currentKey)) {
    const { proponent: id, ...block } = row[key] as Record<string, unknown>;
    const org = typeof id === 'string' ? orgs.get(id) : id;
    project[key] = org ? { ...block, proponent: org } : block;
  }
  const current = toLegacyProject(row);
  if (proponent) {
    current.proponent = proponent;
  } else {
    delete current.proponent;
  }
  project[currentKey] = current;
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
  return projectService.getNative(projId).pipe(
    mergeMap(row => demiApi.byIds<Organization>('organizations', proponentIds(row)).pipe(
      map(orgs => toFullProject(row, new Map<string, Org>(orgs.map(org => [org.id, toEagleOrg(org)]))))
    )),
    map(project => asSearchResults([project])),
    catchError(error => {
      logger.error('Failed to load project', 'fullProjectResolver', error);
      toast.error('Failed to load project.');
      return of(asSearchResults([]));
    }),
    mergeMap(data => projectService.getPeopleObjs(data))
  );
};
