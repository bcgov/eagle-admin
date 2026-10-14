import { Project } from '../project';
import { natureBuildMapper } from '../../shared/utils/utils';
import { DemiProject } from './project';

/** A legacy `Project` built from a DEMI row. `_id` is the Eagle id (null when the row has none); `demiId` is the DEMI id. */
export type LegacyProject = Project & { demiId: string };

/** Builds the legacy `Project` screens still read. A row without `eagleId` gets `_id = null`, so writes refuse it. */
export function toLegacyProject(row: DemiProject): LegacyProject {
  const { id, eagleId, projectType, projectState, address, proponentId, proponentName, centroid, ...rest } = row;
  const project = new Project({
    ...rest,
    _id: eagleId ?? null,
    type: projectType,
    status: projectState,
    location: address,
    proponent: proponentId || proponentName ? { _id: proponentId ?? null, name: proponentName ?? null } : undefined,
    // Project's constructor copies centroid as an array; DEMI stores a GeoJSON point.
    centroid: centroid?.coordinates ?? [],
    nature: natureBuildMapper(row.build)
  });
  return Object.assign(project, { demiId: id });
}
