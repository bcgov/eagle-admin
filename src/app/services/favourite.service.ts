import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root'
})

export class FavouriteService {
  favourites = new BehaviorSubject<Array<any>>([]);

  constructor(
    private searchService: SearchService,
  ) {
  }

  async fetchData(fields: any[], pageNum: number = 1, pageSize: number = 10) {
    this.searchService.getSearchResults('', 'Favourite', fields, pageNum, pageSize)
      .subscribe(res => {
        this.favourites.next(res[0].data.favourites);
      })

  }

  getFavourites(): Observable<Object> {
    return this.favourites.asObservable();
  }

  isFavourite(_id: string): boolean {
    return this.favourites.value.indexOf(_id) > -1;
  }

}
