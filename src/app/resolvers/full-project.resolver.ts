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

/** The project's Act, else its newest named block's year; a row with neither, such as a Track-only one, is 2018. */
function currentYear(row: DemiProject): number {
  const storedYears = blockKeys(row)
    .filter(key => (row[key] as { name?: unknown }).name)
    .map(key => Number(key.slice('legislation_'.length)));
  return actYear(row) ?? (storedYears.length ? Math.max(...storedYears) : 2018);
}

/** The Organization ids a row names: its `proponentId` and each older-Act block's `proponent`. */
function proponentIds(row: DemiProject, currentKey: string): string[] {
  const blockIds = blockKeys(row).filter(key => key !== currentKey).map(key => (row[key] as { proponent?: unknown }).proponent);
  return [...new Set([row.proponentId, ...blockIds].filter((id): id is string => typeof id === 'string' && id !== ''))];
}

/**
 * eagle-api's `projectLegislation=all&populate=true` shape from a DEMI row. The current Act's block is
 * the top level, since DEMI's PUT writes only there. Proponent ids become Organizations; older blocks drop unknown ones, as eagle-api did.
 */
function toFullProject(row: DemiProject, year: number, currentKey: string, orgs: Map<string, Org>): FullProject {
  const stored = Array.isArray(row.legislationYearList) ? row.legislationYearList.map(Number) : [];
  const project: Record<string, unknown> = {
    ...row,
    currentLegislationYear: currentKey,
    demiRow: row,
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
  }
  if (!current.centroid?.length) {
    // The edit tabs default an absent centroid to Victoria; an empty array would skip that.
    current.centroid = undefined;
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
  return projectService.getNative(projId, { fresh: route.data?.['freshRead'] === true }).pipe(
    mergeMap(row => {
      const year = currentYear(row);
      const currentKey = `legislation_${year}`;
      return demiApi.byIds<Organization>('organizations', proponentIds(row, currentKey)).pipe(
        map(orgs => toFullProject(row, year, currentKey, new Map<string, Org>(orgs.map(org => [org.id, toEagleOrg(org)]))))
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
