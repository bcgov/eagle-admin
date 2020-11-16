import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {
  // defaults
  private _baseLayerName = 'World Topographic'; // NB: must match a valid base layer name
  private _lists = [];
  private _regions = [];
  private configuration = { };

  constructor(private httpClient: HttpClient) { }

  /**
   * Initialize the Config Service.  Get configuration data from front-end build, or back-end if nginx
   * is configured to pass the /config endpoint to a dynamic service that returns JSON.
   */
  public async init() {
    try {
      this.configuration = await this.httpClient.get('/api/config').toPromise();

      console.log('Configuration:', this.configuration);
      if (this.configuration['debugMode']) {
        console.log('Configuration:', this.configuration);
      }
    } catch (e) {
      // Not configured
      console.log('Error getting configuration:', e);
      this.configuration = window['__env'];
      if (this.configuration['debugMode']) {
        console.log('Configuration:', this.configuration);
      }
    }

    try {
      // Get the Lists and set the Regions datasets
      const lists = await this.httpClient.get<any>(`${this.configuration['API_LOCATION']}${this.configuration['API_PATH']}/search?pageSize=1000&dataset=List`, {}).toPromise();
      this._lists = lists[0].searchResults;
      this.populateRegionsList();
    } catch (e) {
      if (this.configuration['debugMode']) {
        console.log('Getting list error:', e);
      }
    }

    return Promise.resolve();
  }
  get config(): any {
    return this.configuration;
  }

  // getters/setters
  get lists(): any[] { return this._lists; }
  get regions(): any { return this._regions; }
  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

  private populateRegionsList() {
    this._lists.map(item => {
      switch (item.type) {
        case 'region':
          this._regions.push(item.name);
          break;
      }
    });
  }
}
