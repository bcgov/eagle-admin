import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

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

/**
 * Configuration Service
 * 
 * Manages application configuration with two modes:
 * 
 * LOCAL DEV (configEndpoint = false):
 *   - Uses values from src/env.js directly
 *   - API calls use Angular proxy (proxy.conf.json)
 * 
 * DEPLOYED (configEndpoint = true):
 *   - env.js is modified by GitHub workflow: sed changes configEndpoint to true
 *   - Fetches config from /api/config endpoint
 *   - API config values override env.js defaults
 *   - nginx routes /api/* to the API server
 */
@Injectable()
export class ConfigService {
  private httpClient = inject(HttpClient);

  // Configuration as a signal for reactivity
  private _config = signal<EnvConfig>({});
  private configLoaded = false;

  // Expose config as a computed signal that components can react to
  public readonly config = computed(() => this._config());

  // UI state
  private _baseLayerName = 'World Topographic';
  private _lists: any[] = [];
  private _regions: any[] = [];

  /**
   * Initialize the Config Service.
   * 
   * Flow:
   * 1. Load env.js values (already set on window.__env before Angular loads)
   * 2. If configEndpoint=true (deployed), fetch config from /api/config
   * 3. Load lists from API
   */
  public async init(): Promise<void> {
    // Step 1: Start with env.js values (loaded before Angular via script tag)
    this._config.set({ ...(window.__env || {}) });

    if (this._config().logLevel === 0) {
      console.log('ConfigService: env.js values:', this._config());
    }

    // Step 2: If deployed (configEndpoint=true), fetch config from API
    if (this._config().configEndpoint === true) {
      try {
        const apiConfig = await this.getConfigFromApi();
        // Preserve eagle-admin's own client ID (don't use API's client ID)
        const preservedClientId = this._config().KEYCLOAK_CLIENT_ID;
        // Merge: API values override env.js values (except KEYCLOAK_CLIENT_ID)
        this._config.set({ ...this._config(), ...apiConfig, KEYCLOAK_CLIENT_ID: preservedClientId });
        if (this._config().logLevel === 0) {
          console.log('ConfigService: merged with API config:', this._config());
        }
      } catch (e) {
        console.error('ConfigService: API config failed, using env.js defaults:', e);
      }
    }

    this.configLoaded = true;

    // Step 3: Load lists from API
    try {
      const apiPath = this.getApiPath();
      const lists = await firstValueFrom(
        this.httpClient.get<any>(`${apiPath}/search?pageSize=1000&dataset=List`)
          .pipe(timeout(10000))
      );
      this._lists = lists[0].searchResults;
      this.populateRegionsList();
    } catch (e) {
      console.error('ConfigService: Error loading lists:', e);
    }
  }

  /**
   * Get the API path for making API calls.
   * 
   * LOCAL DEV (configEndpoint=false): Returns full URL if API_LOCATION set
   * DEPLOYED (configEndpoint=true): Returns relative path (nginx handles routing)
   */
  public getApiPath(): string {
    const cfg = this._config();
    const apiPath = cfg.API_PATH || '/api';
    
    // If LOCAL DEV and API_LOCATION is set, use full URL
    if (cfg.configEndpoint === false && cfg.API_LOCATION) {
      return cfg.API_LOCATION + apiPath;
    }
    
    // Deployed: use relative path (nginx routes /api/* to eagle-api)
    return apiPath;
  }

  /**
   * Fetch configuration from nginx-served JSON.
   * Only called when configEndpoint=true (deployed environments).
   * Retries with fibonacci backoff, times out to prevent blocking.
   */
  private async getConfigFromApi(): Promise<EnvConfig> {
    let n1 = 0;
    let n2 = 1;
    let attempts = 0;
    const maxAttempts = 3;
    const requestTimeoutMs = 5000;

    while (attempts < maxAttempts) {
      try {
        // Fetch config from nginx-served ConfigMap JSON
        // No Authorization header needed - public static file
        const response = await firstValueFrom(
          this.httpClient.get<EnvConfig>('/config.json', { observe: 'response' })
            .pipe(timeout(requestTimeoutMs))
        );
        return response.body || {};
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.warn(`ConfigService: Config fetch failed after ${maxAttempts} attempts`);
          throw err;
        }
        console.warn(`ConfigService: Config fetch attempt ${attempts}/${maxAttempts} failed, retrying...`);
        const delay = n1 + n2;
        await this.delay(delay * 1000);
        n1 = n2;
        n2 = delay;
      }
    }
    throw new Error('Failed to load config from /config.json');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get logLevel(): number {
    // Can be overridden by js console
    return window.__env?.logLevel ?? 4;
  }

  // Note: config is now a computed signal - use config() to get value
  // e.g., configService.config().ENVIRONMENT

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
