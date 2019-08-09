import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
  constructor() { }

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

  public encode(component: string) {
        let encoded = encodeURIComponent(component);
        return encoded.replace(/[!'()*]/g, (c) => {
        // Also encode !, ', (, ), and *
          return '%' + c.charCodeAt(0).toString(16);
        });
  }

  public encodeFilename(filename: string, isUrl: boolean) {
    let safeName;
    if (isUrl) {
        return safeName = this.encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_');
    } else {
        return safeName = filename.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_');
    }

  }
}
