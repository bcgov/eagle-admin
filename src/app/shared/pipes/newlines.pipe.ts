import { Pipe, PipeTransform } from '@angular/core';

//
// Filter to change newlines to HTML linebreaks.
//
@Pipe({
    name: 'newlines',
    standalone: false
})

export class NewlinesPipe implements PipeTransform {
  transform(value: any): any {
    const input = value || '';
    return input.replace(/\n/g, '<br />');
  }
}
