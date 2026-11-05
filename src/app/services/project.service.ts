import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { DemiApiService } from './demi-api.service';
import { FullProject } from '../models/fullProject';
import { Project } from '../models/project';
import { Organization } from '../models/demi/organization';
import { DemiProject } from '../models/demi/project';
import { LegacyProject, toLegacyProject } from '../models/demi/project-legacy';
import { toDemiProjectWrite } from '../models/demi/project-write';
import { DemiList, DemiListParams } from '../models/demi/demi-list';
import { extractFromSearchResults, natureBuildMapper } from '../shared/utils/utils';

interface UserRow {
  id: string;
}

/** A legacy project, read by its `demiId`, else its `_id`. */
type ProjectRef = Pick<Project, '_id'> & { demiId?: string; legislationYear?: number };

/** What DEMI's extension routes answer: the project's two lists, each item with its `id`. */
export interface ProjectExtensionLists {
  reviewExtensions: (ProjectExtension & { id: string })[];
  reviewSuspensions: (ProjectExtension & { id: string })[];
}

/** An extension or suspension as the extension form sends it; `type` is `Extension` or `Suspension`. */
export interface ProjectExtension {
  type: string;
  appliedTo: string;
  start: Date | string | null;
  end: Date | string | null;
}

const PUBLISH = { level: 4, confirm: true, reason: 'Published in EPIC admin' };
// Level 2 is staff only, where eagle-api's unpublish left a project.
const UNPUBLISHED_LEVEL = 2;

const NOT_OPENED = 'Project created, but it could not be opened to staff';
const NOT_SAVED = 'Project created, but not every field was saved';
const NOT_PUBLISHED = 'Project created and saved, but not published';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private configService = inject(ConfigService);
  private demiApi = inject(DemiApiService);

  /** One page of DEMI projects, sorted by name unless `params.sort` says otherwise. */
  list(params: DemiListParams = {}): Observable<DemiList<DemiProject>> {
    return this.demiApi.list<DemiProject>('projects', { count: true, sort: 'name', ...params });
  }

  /** A DEMI project by DEMI id or Eagle id; `fresh` skips the HTTP cache. */
  getNative(id: string, { fresh = false } = {}): Observable<DemiProject> {
    return this.demiApi.get<DemiProject>('projects', id, { fresh });
  }

  getUsers<T extends UserRow>(ids: string[]): Observable<T[]> {
    return this.demiApi.byIds<T>('users', ids);
  }

  getGroup<T>(groupId: string): Observable<T> {
    return this.demiApi.get<T>('groups', groupId);
  }

  /** Comment periods of one project. `demiProjectId` is the DEMI project id, not the Eagle id. */
  getCommentPeriods<T>(demiProjectId: string, params: DemiListParams = {}): Observable<DemiList<T>> {
    return this.demiApi.list<T>('comment-periods', {
      count: true,
      ...params,
      filters: { ...params.filters, project: demiProjectId }
    });
  }

  // Contact pickers and the edit forms read the Eagle `_id`; DEMI user ids are the Eagle ids.
  private usersById(ids: string[]): Observable<Map<string, UserRow & { _id: string }>> {
    return this.getUsers(ids).pipe(map(rows => new Map(rows.map(row => [row.id, { ...row, _id: row.id }]))));
  }

  public getPeopleObjs(data): Observable<any> {
    // Used in Full Project Resolver using current legislation as our key
    const projectSearchData = extractFromSearchResults<FullProject>(data);
    if (!projectSearchData) {
      return of(data);
    }
    const fullProject = projectSearchData[0];
    if (!fullProject) {
      return of(data);
    }
    const projectKeys: number[] = fullProject.legislationYearList;
    const peopleObjs: Observable<any>[] = [];
    projectKeys.forEach(key => {
      const project = fullProject[`legislation_${key.toString()}`];
      if (!project || Object.keys(project).length === 0 || !project.name) {
        return;
      }
      project.nature = natureBuildMapper(project.build);

      const epdId = (project.responsibleEPDId) ? project.responsibleEPDId.toString() : '';
      const leadId = (project.projectLeadId) ? project.projectLeadId.toString() : '';
      if (!epdId && !leadId) {
        return;
      }
      peopleObjs.push(this.usersById([epdId, leadId]).pipe(
        map(users => {
          project.responsibleEPDObj = users.get(epdId);
          project.projectLeadObj = users.get(leadId);
        })
      ));
    });
    // The resolver takes the first emission, so it waits for every block's contacts.
    return (peopleObjs.length > 0) ? forkJoin(peopleObjs).pipe(map(() => data)) : of(data);
  }

  /**
   * Creates the project in DEMI, which makes its id, sets level 2, writes the form's other fields, then publishes when
   * `publish`. A step after the create fails with `ProjectCreatedPartlyError`, which names the new id.
   */
  add(project: Project, { publish = false } = {}): Observable<LegacyProject> {
    const { name, description, sector, region, projectState, centroid } =
      toDemiProjectWrite(project, this.configService.lists, {} as DemiProject);
    return this.demiApi.create<DemiProject>('projects', { name, description, sector, region, projectState, centroid }).pipe(
      mergeMap(row => {
        const step = (request: Observable<DemiProject>, failure: string, saved = false) => request.pipe(
          catchError(error => throwError(() => new ProjectCreatedPartlyError(row.id, failure, error, saved)))
        );
        // Level 2 first, so a failed PUT leaves an unpublished row that a normal save repairs.
        const written = step(this.demiApi.action<DemiProject>('projects', row.id, 'level', { level: UNPUBLISHED_LEVEL }), NOT_OPENED).pipe(
          mergeMap(() => step(this.writeForm(project, row), NOT_SAVED))
        );
        // Publishing after the PUT, so DEMI checks the year the PUT stored.
        return publish
          ? written.pipe(mergeMap(() => step(this.demiApi.action<DemiProject>('projects', row.id, 'level',
            publishBody(project.legislationYear)), NOT_PUBLISHED, true)))
          : written;
      }),
      map(toLegacyProject)
    );
  }

  /**
   * Writes the edit form's fields to DEMI. `project._id` is the route id; `held` names the tab's fields; `shown` is the row
   * the form was built from. Another Act's tab is refused: DEMI's PUT writes the current Act's fields.
   */
  save(project: Project, held?: readonly string[], shown?: DemiProject): Observable<LegacyProject> {
    return this.onFreshRow(refId(project), row => {
      const year = actYear(row);
      if (project.legislationYear && year && Number(project.legislationYear) !== year) {
        return throwError(() => new Error(otherActMessage(year, project.legislationYear)));
      }
      // Against the shown row, a List field another user changed since is not reverted; a new phase joins the stored history.
      const compared = shown ? { ...shown, phaseHistory: row.phaseHistory } : row;
      return this.writeForm(project, compared, held).pipe(map(toLegacyProject));
    });
  }

  /** Publishes to level 4. A project's `legislationYear` makes that Act current, as eagle-api's publish did. */
  publish(project: ProjectRef): Observable<LegacyProject> {
    return this.setLevel(project, publishBody(project.legislationYear));
  }

  unPublish(project: ProjectRef): Observable<LegacyProject> {
    return this.setLevel(project, { level: UNPUBLISHED_LEVEL });
  }

  /** Both lists, uncached so a list read after a write shows it. Takes the DEMI id only, as the writes do. */
  getExtensions(demiId: string): Observable<ProjectExtensionLists> {
    return this.demiApi.get<ProjectExtensionLists>(`projects/${encodeURIComponent(demiId)}`, 'extensions', { fresh: true });
  }

  addExtension(project: ProjectRef, extension: ProjectExtension): Observable<ProjectExtensionLists> {
    return this.onFreshRow(refId(project), row =>
      this.demiApi.create<ProjectExtensionLists>(extensionsOf(row), extensionBody(extension)));
  }

  editExtension(project: ProjectRef, change: { new: ProjectExtension; old: { id: string } }): Observable<ProjectExtensionLists> {
    return this.onFreshRow(refId(project), row =>
      this.demiApi.update<ProjectExtensionLists>(extensionsOf(row), change.old.id, extensionBody(change.new)));
  }

  deleteExtension(project: ProjectRef, item: { id: string }): Observable<ProjectExtensionLists> {
    return this.onFreshRow(refId(project), row => this.demiApi.remove<ProjectExtensionLists>(extensionsOf(row), item.id));
  }

  /** Adds organizations to the project's pin list in DEMI. `projId` is the DEMI or Eagle id. */
  addPins(projId: string, orgIds: string[]): Observable<DemiProject> {
    return this.writePins(projId, row => ({ pins: [...pinIds(row), ...orgIds] }));
  }

  deletePin(projId: string, orgId: string): Observable<DemiProject> {
    return this.writePins(projId, row => ({ pins: pinIds(row).filter(id => id !== orgId) }));
  }

  publishPins(projId: string): Observable<DemiProject> {
    return this.writePins(projId, () => ({ pinsPublished: true }));
  }

  unpublishPins(projId: string): Observable<DemiProject> {
    return this.writePins(projId, () => ({ pinsPublished: false }));
  }

  // DEMI's PUT takes the full pin list. Pins this caller cannot read are missing from the read, and DEMI keeps them.
  private writePins(projId: string, body: (row: DemiProject) => object): Observable<DemiProject> {
    return this.onFreshRow(projId, row => this.demiApi.update<DemiProject>('projects', row.id, body(row)));
  }

  /** DEMI writes take the DEMI id only, and a body built on the row needs it uncached: read it first, by DEMI or Eagle id. */
  private onFreshRow<T>(projId: string, write: (row: DemiProject) => Observable<T>): Observable<T> {
    return this.demiApi.get<DemiProject>('projects', projId, { fresh: true }).pipe(mergeMap(write));
  }

  private setLevel(project: ProjectRef, body: object): Observable<LegacyProject> {
    return this.onFreshRow(refId(project), row => this.demiApi.action<DemiProject>('projects', row.id, 'level', body)).pipe(
      map(toLegacyProject)
    );
  }

  private writeForm(project: Project, row: DemiProject, held?: readonly string[]): Observable<DemiProject> {
    return this.withProponentName(row, toDemiProjectWrite(project, this.configService.lists, row, held)).pipe(
      // DEMI rewrites the row on any PUT, so nothing changed sends none.
      mergeMap(body => (Object.keys(body).length ? this.demiApi.update<DemiProject>('projects', row.id, body) : of(row)))
    );
  }

  // DEMI stores the proponent's name beside its id and does not look it up itself.
  private withProponentName(row: DemiProject, body: Record<string, unknown>): Observable<Record<string, unknown>> {
    const id = body.proponentId;
    if (typeof id !== 'string' || !id || id === row.proponentId || body.proponentName !== undefined) {
      return of(body);
    }
    return this.demiApi.get<Organization>('organizations', id).pipe(map(org => ({ ...body, proponentName: org.name })));
  }
}

/** A create whose POST went through but a later step failed. `id` is the new DEMI id; `saved` is true once the form's fields are stored. */
export class ProjectCreatedPartlyError extends Error {
  override name = 'ProjectCreatedPartlyError';

  constructor(readonly id: string, failure: string, cause: Error, readonly saved: boolean) {
    super(`${failure}: ${cause.message}`, { cause });
  }
}

function publishBody(year: number | undefined): object {
  return year ? { ...PUBLISH, legislationYear: year } : PUBLISH;
}

function pinIds(row: DemiProject): string[] {
  return (row.pins ?? []).map(pin => pin._id);
}

function refId(project: ProjectRef): string {
  return project.demiId || project._id;
}

export function otherActMessage(projectYear: number, tabYear: number): string {
  return `Changes on the ${tabYear} tab cannot be saved: this project is under the ${projectYear} Act.`;
}

/** The project's Act: `legislationYear`, else the year in `currentLegislationYear` or the `legislation` label. */
export function actYear(row: DemiProject): number | null {
  if (row.legislationYear) {
    return Number(row.legislationYear);
  }
  const match = /\d{4}/.exec(String(row.currentLegislationYear ?? '')) ?? /\b\d{4}\b/.exec(String(row.legislation ?? ''));
  return match ? Number(match[0]) : null;
}

function extensionsOf(row: DemiProject): string {
  return `projects/${encodeURIComponent(row.id)}/extensions`;
}

// DEMI's extension schema takes these four only (domain/extensions.js ITEM_SCHEMA).
function extensionBody({ type, appliedTo, start, end }: ProjectExtension): ProjectExtension {
  return { type, appliedTo, start, end };
}
