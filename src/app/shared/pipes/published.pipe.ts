import { Pipe, PipeTransform } from '@angular/core';

//
// Filter to return only published items from an array.
//
@Pipe({
    name: 'published',
    standalone: false
})

export class PublishedPipe implements PipeTransform {
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item.isPublished);
  }
}
