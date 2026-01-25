import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: string[] | null, query: string): string[] {
    if (!items) {
      return [];
    }

    if (items.length === 0 || query === '') {
      return items;
    }

    return items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  }

}
