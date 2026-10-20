import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelService {

  // data rows must be flat objects; excelFileName has no extension.
  public exportAsExcelFile(data: any[], excelFileName: string, columnOrder: Array<string> = []): void {
    const json_opts: XLSX.JSON2SheetOpts = { header: columnOrder };
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, json_opts);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const write_opts: XLSX.WritingOptions = { bookType: 'xlsx' };
    XLSX.writeFile(workbook, excelFileName + '.xlsx', write_opts);
  }

}
