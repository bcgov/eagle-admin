import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface EnvConfig {
  logLevel?: number;
  configEndpoint?: boolean;
  ENVIRONMENT?: string;
  BANNER_COLOUR?: string;
  API_PATH?: string;
  API_LOCATION?: string;
  KEYCLOAK_CLIENT_ID?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_ENABLED?: boolean;
  ANALYTICS_API_URL?: string | null;
  ANALYTICS_DEBUG?: boolean;
  REDIRECT_KEY?: string;
}

// env.js sets window.__env before Angular loads
declare global {
  interface Window { __env: EnvConfig; }
}

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {
  private httpClient = inject(HttpClient);

  // defaults
  private _baseLayerName = 'World Topographic'; // NB: must match a valid base layer name
  private _lists = [];
  private _regions = [];
  private configuration: EnvConfig = {};
  private configLoaded = false;

  /**
   * Initialize the Config Service.
   * Get configuration from env.js first, then from API if configEndpoint is true.
   * Pattern follows reserve-rec-public.
   */
  public async init(): Promise<void> {
    // Start with env.js values (loaded before Angular via script tag in index.html)
    this.configuration = window.__env || {};

    if (this.configuration.logLevel === 0) {
      console.log('Initial configuration from env.js:', this.configuration);
    }

    // If configEndpoint is true (deployed environments), fetch config from API
    if (this.configuration.configEndpoint === true) {
      try {
        const apiConfig = await this.getConfigFromApi();
        // Merge API config (API values take precedence)
        this.configuration = { ...this.configuration, ...apiConfig };
      } catch (e) {
        // If API fails, continue with env.js values
        console.error('Error getting API configuration, using env.js defaults:', e);
      }
    }

    this.configLoaded = true;

    if (this.configuration.logLevel === 0) {
      console.log('Final configuration:', this.configuration);
    }

    // Get the Lists and set the Regions datasets
    try {
      const apiPath = this.getApiPath();
      const lists = await firstValueFrom(
        this.httpClient.get<any>(`${apiPath}/search?pageSize=1000&dataset=List`)
      );
      this._lists = lists[0].searchResults;
      this.populateRegionsList();
    } catch (e) {
      console.error('Error loading lists:', e);
    }
  }

  /**
   * Get the API path for making API calls.
   * Uses API_LOCATION + API_PATH, otherwise falls back to relative /api.
   */
  private getApiPath(): string {
    if (this.configuration.API_LOCATION) {
      return this.configuration.API_LOCATION + (this.configuration.API_PATH || '');
    }
    // Fallback to relative path (for deployed environments with nginx proxy)
    return '/api';
  }

  /**
   * Fetch configuration from API endpoint.
   * Retries with fibonacci backoff if API is unavailable.
   */
  private async getConfigFromApi(): Promise<EnvConfig> {
    let n1 = 0;
    let n2 = 1;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const headers = new HttpHeaders().set('Authorization', 'config');
        // Use API_LOCATION if set, otherwise relative /api/config (nginx proxies in deployed env)
        const apiBase = this.configuration.API_LOCATION || '';
        const url = apiBase + '/api/config';

        const response = await firstValueFrom(
          this.httpClient.get<any>(url, { headers, observe: 'response' })
        );
        return response.body?.data || response.body;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw err;
        }
        console.log(`Config API attempt ${attempts} failed, retrying...`);
        const delay = n1 + n2;
        await this.delay(delay * 1000);
        n1 = n2;
        n2 = delay;
      }
    }
    throw new Error('Failed to load config from API');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get logLevel(): number {
    // Can be overridden by js console
    return window.__env?.logLevel ?? 4;
  }

  get config(): EnvConfig {
    return this.configuration;
  }

  get isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  // getters/setters
  get lists(): any[] { return this._lists; }
  get regions(): any[] { return this._regions; }
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
