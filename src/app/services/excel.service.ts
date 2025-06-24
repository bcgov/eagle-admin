import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// Refs:
// https://github.com/luwojtaszek/ngx-excel-export
// https://www.npmjs.com/package/xlsx
// https://github.com/SheetJS/js-xlsx

@Injectable()
export class ExcelService {

  // data: array of objects (flattened)
  // excelFileName: filename without extension
  // columnOrder: array of keys
  public exportAsExcelFile(data: any[], excelFileName: string, columnOrder: Array<string> = []): void {
    const json_opts: XLSX.JSON2SheetOpts = { header: columnOrder };
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, json_opts);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const write_opts: XLSX.WritingOptions = { bookType: 'xlsx' };
    XLSX.writeFile(workbook, excelFileName + '.xlsx', write_opts);
  }

}
