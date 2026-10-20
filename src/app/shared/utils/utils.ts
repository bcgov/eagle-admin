import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { Constants } from './constants';
import { ISearchResults } from 'src/app/models/search';
import { DemiDocumentFilters } from 'src/app/models/demi/document';

// Patch encodeURIComponent once at module load to also encode !, ', (, ), *
const _origEncode = encodeURIComponent;
(window as any)['encodeURIComponent'] = (component: string) =>
  _origEncode(component).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));

export function formatDate(date: any): string | null {
  if (!date) { return null; }
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) { month = '0' + month; }
  if (day.length < 2) { day = '0' + day; }
  return [year, month, day].join('');
}

export function convertJSDateToNGBDate(jSDate: Date) {
  return {
    year: jSDate.getFullYear(),
    month: jSDate.getMonth() + 1,
    day: jSDate.getDate()
  };
}

export function convertFormGroupNGBDateToJSDate(nGBDate: any, nGBTime: any = null): Date {
  if (nGBTime === null) {
    return new Date(nGBDate.year, nGBDate.month - 1, nGBDate.day);
  }
  return new Date(nGBDate.year, nGBDate.month - 1, nGBDate.day, nGBTime.hour, nGBTime.minute);
}

/** True for a complete NGB date struct. */
export function isNgbDate(date: any): date is NgbDateStruct {
  return !!(date?.year && date.month && date.day);
}

/** `YYYY-MM-DD` of an NGB date struct, or null when it is incomplete. */
export function ngbDateToIso(date: any): string | null {
  return isNgbDate(date) ? DateTime.fromObject({ year: date.year, month: date.month, day: date.day }).toISODate() : null;
}

/** NGB date struct of a `YYYY-MM-DD` string, or null when it is not a valid date. */
export function isoToNgbDate(iso: string | null | undefined): NgbDateStruct | null {
  const date = DateTime.fromISO(iso ?? '');
  return date.isValid ? { year: date.year, month: date.month, day: date.day } : null;
}

export function formatBytes(bytes: any, decimals = 2): string {
  if (bytes == null) { return '-'; }
  if (bytes === 0) { return '0 Bytes'; }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function encodeParams(inputParam: string): string {
  return encodeURIComponent(inputParam).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function encodeString(filename: string, isUrl: boolean): string {
  if (isUrl) {
    return encodeURIComponent(filename)
      .replace(/\(/g, '%28').replace(/\)/g, '%29')
      .replace(/\\/g, '_').replace(/\//g, '_').replace(/%2F/g, '_').replace(/ /g, '_');
  }
  return filename.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_');
}

/** Saves a blob the page already holds as a file named `filename`. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function extractFromSearchResults<T>(results: ISearchResults<T>[]): T[] | null {
  if (!results) { return null; }
  const data = results[0].data;
  if (!data) { return null; }
  return data.searchResults as T[];
}

export function isEmptyObject(object: object): boolean {
  if (!object) { return true; }
  for (const i in object) {
    if (Object.prototype.hasOwnProperty.call(object, i)) { return false; }
  }
  return true;
}

export function natureBuildMapper(key: string): string {
  if (!key) { return ''; }
  const natureObj = Constants.buildToNature.find(obj => obj.build === key);
  return natureObj ? natureObj.nature : key;
}

/** `GET /documents` filters for the application sort screen: application materials and memos at the application milestones, outside amendment phases. */
export function applicationDocumentFilters(list: Array<any>, project: string): DemiDocumentFilters {
  const types = [
    { legislation: 2002, name: 'Application Materials' },
    { legislation: 2018, name: 'Application Materials' },
    { legislation: 2002, name: 'Scientific Memo' },
    { legislation: 2018, name: 'Independent Memo' }
  ];
  const milestones = [
    { legislation: 2002, name: 'Application Review' },
    { legislation: 2018, name: 'Revised EAC Application' },
  ];
  const applications = [
    { legislation: 2002, name: 'Post Decision - Amendment' },
    { legislation: 2018, name: 'Post Decision - Amendment' }
  ];

  // Match on type too: some names, such as 'Application Review', are both a phase and a milestone.
  const ids = (type: string, terms: Array<{ legislation: number; name: string }>): string[] => list
    .filter(item => item.type === type && terms.some(term => term.name === item.name && term.legislation === item.legislation))
    .map(item => item.id);
  const amendmentPhaseIds = ids('projectPhase', applications);
  const phases = list
    .filter(item => item.type === 'projectPhase' && !amendmentPhaseIds.includes(item.id))
    .map(item => item.id);

  return {
    project,
    documentSource: 'PROJECT',
    typeId: ids('doctype', types),
    milestoneId: ids('label', milestones),
    projectPhaseId: phases.length ? phases : undefined
  };
}

/** ng-select `compareWith` for filter options: regions by `code`, organizations by `_id`, List rows by `id`. */
export function filterCompareWith(filter: any, filterToCompare: any): boolean {
  const key = ['code', '_id', 'id'].find(k => filter.hasOwnProperty(k));
  return !!key && !!filterToCompare && filter[key] === filterToCompare[key];
}

