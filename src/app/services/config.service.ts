import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api';
import { Subject } from 'rxjs/Subject';
import { Observable, of } from 'rxjs';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService implements OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // defaults
  private _baseLayerName = 'World Topographic'; // NB: must match a valid base layer name
  private _lists = [];
  private _regions = [];

  constructor(private api: ApiService) { }

  // called by app constructor
  public init() {
  }

  // called by app constructor
  public destroy() {
    // FUTURE: save settings to window.localStorage?
  }

  // getters/setters
  get lists(): any[] { return this._lists; }
  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

  public getLists(): Observable<any> {
    if (this._lists.length === 0) {
      return this.api.getFullDataSet('List')
        .map(res => {
          if (res) {
            this._lists = res[0].searchResults;
            return this._lists;
          }
          return null;
        })
        .catch(error => this.api.handleError(error));
    } else {
      return of(this._lists);
    }
  }

  // Manual cache of the list without using the getLists() function
  public addLists(list) {
    if (this._lists.length === 0 && list) {
      this._lists = [...list];
    }
  }

  public getRegions(): Observable<any> {
    if (this._lists.length === 0) {
      return this.api.getFullDataSet('List')
        .map(res => {
          if (res) {
            this._lists = res[0].searchResults;
            this.populateRegionsList();
            return this._regions;
          }
          return null;
        })
        .catch(error => this.api.handleError(error));
    } else if (this._regions.length === 0) {
      this.populateRegionsList();
      return of(this._regions);
    } else {
      return of(this._regions);
    }
  }

  private populateRegionsList() {
    this._lists.map(item => {
      switch (item.type) {
        case 'region':
          this._regions.push(item.name);
          break;
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
