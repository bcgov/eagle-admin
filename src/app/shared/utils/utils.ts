import { Injectable } from '@angular/core';
import { ISearchResults } from 'app/models/search';
import {Constants} from './constants';

const encode = encodeURIComponent;
window['encodeURIComponent'] = (component: string) => {
  return encode(component).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
};


@Injectable()
export class Utils {
  constructor() { }

  public formatDate(date) {
    if (date) {
      let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) { month = '0' + month; }
      if (day.length < 2) { day = '0' + day; }

      return [year, month, day].join('');
    } else {
      return null;
    }
  }

  public convertJSDateToNGBDate(jSDate: Date) {
    return {
      'year': jSDate.getFullYear(),
      'month': jSDate.getMonth() + 1,
      'day': jSDate.getDate()
    };
  }

  public convertFormGroupNGBDateToJSDate(nGBDate, nGBTime = null) {
    if (nGBTime === null) {
      return new Date(
        nGBDate.year,
        nGBDate.month - 1,
        nGBDate.day
      );
    } else {
      return new Date(
        nGBDate.year,
        nGBDate.month - 1,
        nGBDate.day,
        nGBTime.hour,
        nGBTime.minute,
      );
    }
  }

  public formatBytes(bytes, decimals = 2) {
    if (bytes == null) { return '-'; }
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  public encodeParams(inputParam: string) {
    return encode(inputParam).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  public encodeString(filename: string, isUrl: boolean) {
    let safeName;
    if (isUrl) {
      return safeName = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_').replace(/ /g, '_');
    } else {
      return safeName = filename.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_');
    }

  }

  public getFormattedTime(date) {
    let y = date.getFullYear();
    // JavaScript months are 0-based.
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let h = date.getHours();
    let mi = date.getMinutes();
    let s = date.getSeconds();
    return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
  }
    // This function will take in a ISearchResults of some type and return an array of that same type
    public extractFromSearchResults<T>(results: ISearchResults<T>[]): T[] {
      if (!results) {return null; }
      const data = results[0].data;
      if (!data) { return null; }
      return <T[]>data.searchResults;
    }

    public isEmptyObject(object: Object): boolean {
      for (let i in object) {
        if (object.hasOwnProperty(i)) { return false; }
      }
      return true ;
    }

    // Mapping the build database field to the human readable nature field
    public natureBuildMapper(key: string): string {
      if (!key) {
        return '';
      }
      const natureObj = Constants.buildToNature.find(obj => obj.build === key);
      return (natureObj) ? natureObj.nature : key;
    }
}
