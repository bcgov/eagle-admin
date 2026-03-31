import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

/**
 * Configuration Service
 *
 * LOCAL DEV (configEndpoint = false):
 *   - Uses env.js values directly (src/env.js)
 *   - proxy.conf.js reads API_LOCATION from env.js to generate dev server proxy rules
 *   - App uses relative paths (/api, /analytics) — never API_LOCATION directly
 *
 * DEPLOYED (configEndpoint = true):
 *   - Dockerfile sed sets configEndpoint to true
 *   - App fetches /api/config on startup (nginx serves from ConfigMap)
 *   - ConfigMap values override env.js (except KEYCLOAK_CLIENT_ID — preserved)
 *
 * Lists are lazy-loaded on first access via getLists(), not during init.
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
  private _listsLoaded = false;
  private _regions: any[] = [];

  /**
   * Initialize the Config Service.
   *
   * 1. Reads env.js values from window.__env
   * 2. If deployed (configEndpoint=true), fetches /api/config and merges before returning
   *
   * Must be awaited so Keycloak initializes with the correct config values.
   */
  public async init(): Promise<void> {
    this._config.set({ ...(window.__env || {}) });

    if (this._config().logLevel === 0) {
      console.log('ConfigService: env.js values:', this._config());
    }

    if (this._config().configEndpoint === true) {
      await this.fetchRemoteConfig();
    }

    this.configLoaded = true;
  }

  /**
   * Fetch remote config from /api/config (deployed only, non-blocking).
   * nginx serves this from ConfigMap. On success merges over env.js values.
   * KEYCLOAK_CLIENT_ID is always preserved from env.js.
   */
  private async fetchRemoteConfig(): Promise<void> {
    try {
      const response = await fetch('/api/config', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiConfig: EnvConfig = await response.json();
      const preservedClientId = this._config().KEYCLOAK_CLIENT_ID;
      this._config.set({ ...this._config(), ...apiConfig, KEYCLOAK_CLIENT_ID: preservedClientId });
      if (this._config().logLevel === 0) {
        console.log('ConfigService: merged with API config:', this._config());
      }
    } catch (e) {
      console.error('ConfigService: API config fetch failed, using env.js defaults:', e);
    }
  }

  /**
   * Load lists from API (called lazily on first access to getLists()).
   * Safe to call post-bootstrap — HttpClient works normally here.
   */
  private async loadLists(): Promise<void> {
    try {
      const url = `${this.getApiPath()}/search?pageSize=1000&dataset=List`;
      const lists = await firstValueFrom(this.httpClient.get<any>(url));
      this._lists = lists?.[0]?.searchResults ?? [];
      this.populateRegionsList();
    } catch (e) {
      console.error('ConfigService: Error loading lists:', e);
    }
  }

  /**
   * Get the API path for making API calls.
   * Always relative — proxy.conf.js (local) or nginx (deployed) handles routing.
   */
  public getApiPath(): string {
    return this._config().API_PATH || '/api';
  }

  get isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  get lists(): any[] {
    if (!this._listsLoaded) {
      this._listsLoaded = true;
      this.loadLists();
    }
    return this._lists;
  }

  get regions(): any[] { return this._regions; }
  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

  private populateRegionsList() {
    this._regions = [];
    this._lists.forEach(item => {
      if (item.type === 'region') {
        this._regions.push(item.name);
      }
    });
  }
}
