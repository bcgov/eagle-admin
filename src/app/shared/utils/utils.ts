import { Constants } from './constants';
import { ISearchResults } from 'src/app/models/search';

// Patch encodeURIComponent once at module load to also encode !, ', (, ), *
const _origEncode = encodeURIComponent;
(window as any)['encodeURIComponent'] = (component: string) =>
  _origEncode(component).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));

// ---------------------------------------------------------------------------
// Plain exported functions — no DI required, import directly
// ---------------------------------------------------------------------------

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

export function getFormattedTime(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();
  return `${y}-${m}-${d}-${h}-${mi}-${s}`;
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

function getIdsByName(terms: Array<any>, list: Array<any>) {
  return terms.map(term => {
    const listItem = list.find(item => item.name === term.name && item.legislation === term.legislation);
    return { name: term.name, id: listItem?._id ?? null };
  });
}

export function createProjectTabModifiers(list: Array<any>) {
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

  const amendmentPhaseIds = getIdsByName(applications, list).map(t => t.id);
  const phases = list
    .filter(item => item.type === 'projectPhase' && !amendmentPhaseIds.includes(item._id))
    .map(item => item._id)
    .join(',');

  const typeIds = getIdsByName(types, list).map(t => t.id).join(',');
  const milestoneIds = getIdsByName(milestones, list).map(m => m.id).join(',');

  const queryModifier: any = { documentSource: 'PROJECT', type: typeIds, milestone: milestoneIds };
  if (phases) { queryModifier['projectPhase'] = phases; }
  return queryModifier;
}

