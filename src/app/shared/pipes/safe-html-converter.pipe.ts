
import {DomSanitizer} from '@angular/platform-browser';
import { PipeTransform, Pipe } from '@angular/core';


// This pipe strips out script tags, do not use with (non-staff) user input
@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
