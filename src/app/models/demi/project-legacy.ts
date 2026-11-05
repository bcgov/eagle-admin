import { Project } from '../project';
import { natureBuildMapper } from '../../shared/utils/utils';
import { DemiProject } from './project';
import { DEMI_FIELD_NAMES } from './project-write';

/** A legacy `Project` built from a DEMI row. `_id` is the Eagle id, else the DEMI id; `demiId` is the DEMI id. */
export type LegacyProject = Project & { demiId: string };

/**
 * Builds the legacy `Project` screens still read, renaming each `DEMI_FIELD_NAMES` field back to its Eagle name.
 * `_id` is the id the `/p/:projId` routes take; writes key on `demiId`.
 */
export function toLegacyProject(row: DemiProject): LegacyProject {
  const { id, eagleId, proponentName, centroid, ...rest } = row;
  const fields: Record<string, unknown> = { ...rest };
  for (const [eagleName, demiName] of Object.entries(DEMI_FIELD_NAMES)) {
    delete fields[demiName];
    fields[eagleName] = row[demiName];
  }
  const project = new Project({
    ...fields,
    _id: eagleId ?? id,
    proponent: row.proponentId || proponentName ? { _id: row.proponentId ?? null, name: proponentName ?? null } : undefined,
    // Project's constructor copies centroid as an array; DEMI stores a GeoJSON point.
    centroid: centroid?.coordinates ?? [],
    nature: natureBuildMapper(row.build)
  });
  return Object.assign(project, { demiId: id });
}
