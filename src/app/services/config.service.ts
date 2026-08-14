import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';

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
 *   - App fetches /api/config on startup — today rproxy answers it from a ConfigMap, and
 *     eagle-api serves it from MongoDB once the nginx exact-match block is removed
 *   - API values override env.js (except KEYCLOAK_CLIENT_ID — preserved)
 *
 * Lists are lazy-loaded on first access via getLists(), not during init.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private httpClient = inject(HttpClient);
  private logger = inject(LoggingService);
  private loadingState = inject(LoadingStateService);

  constructor() {
    // Expose ConfigService on window for LoggingService to access
    // (avoids circular dependency since LoggingService can't inject ConfigService)
    (window as any).__configService = this;
  }

  // Configuration as a signal for reactivity
  private _config = signal<EnvConfig>({});
  private configLoaded = false;

  // Expose config as a computed signal that components can react to
  public readonly config = computed(() => this._config());

  // UI state
  private _baseLayerName = 'World Topographic';
  private _lists: any[] = [];
  // ReplaySubject(1) replays the latest lists to any new subscriber immediately.
  // toSignal() bridges it to Angular's signal graph — zone-safe, no manual detectChanges needed.
  private readonly _lists$ = new ReplaySubject<any[]>(1);
  public readonly listsSignal = toSignal(this._lists$, { initialValue: [] as any[] });
  private _listsPromise: Promise<void> | null = null;
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

    this.logger.info(`Initializing ConfigService in ${this._config().ENVIRONMENT} environment`, 'ConfigService');
    this.logger.debug('env.js values:', 'ConfigService', this._config());

    if (this._config().configEndpoint === true) {
      this.logger.info('Fetching remote configuration from /api/config', 'ConfigService');
      await this.fetchRemoteConfig();
    }

    this.configLoaded = true;
    // Kick off list load in background — overlaps with Keycloak init.
    // Fire-and-forget; ensureListsLoaded() is idempotent.
    this.ensureListsLoaded();
  }

  /**
   * Fetch remote config from /api/config (deployed only, blocking).
   * On success merges over env.js values.
   * KEYCLOAK_CLIENT_ID is always preserved from env.js.
   *
   * Throws on transport failure or on a payload with no Keycloak URL/realm —
   * booting on stale env.js defaults would point staff at the wrong identity provider.
   */
  private async fetchRemoteConfig(): Promise<void> {
    const response = await fetch('/api/config', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const apiConfig: EnvConfig = await response.json();
    if (!apiConfig.KEYCLOAK_URL || !apiConfig.KEYCLOAK_REALM) {
      throw new Error('ConfigService: /api/config returned no KEYCLOAK_URL/REALM');
    }
    const preservedClientId = this._config().KEYCLOAK_CLIENT_ID;
    this._config.set({ ...this._config(), ...apiConfig, KEYCLOAK_CLIENT_ID: preservedClientId });
    this.logger.debug('merged with API config:', 'ConfigService', this._config());
  }

  public ensureListsLoaded(): Promise<void> {
    if (!this._listsPromise) {
      this.loadingState.startLoading('lists', 'Loading document metadata');
      this._listsPromise = (async () => {
        try {
          const url = `${this.getApiPath()}/search?pageSize=1000&dataset=List`;
          const response = await firstValueFrom(this.httpClient.get<any>(url));
          this.logger.debug('Lists API raw response:', 'ConfigService', response);
          
          // API usually returns [{ searchResults: [...], meta: [...] }] 
          // but sometimes (Document schema or local mocks) it might return a direct array.
          if (Array.isArray(response) && response[0]?.searchResults) {
            this._lists = response[0].searchResults;
          } else if (Array.isArray(response)) {
            this._lists = response;
          } else if (response?.searchResults) {
            this._lists = response.searchResults;
          } else {
            this._lists = [];
          }

          this.logger.debug(`Resolved ${this._lists.length} list items`, 'ConfigService');
          if (this._lists.length === 0) {
            throw new Error('Lists response was empty or unrecognized format');
          }
          this._lists$.next(this._lists);
          this.populateRegionsList();
        } catch (e) {
          this.logger.error('Error loading lists — will retry on next call', 'ConfigService', e);
          // Reset so next caller triggers a fresh fetch
          this._listsPromise = null;
        } finally {
          this.loadingState.stopLoading('lists');
        }
      })();
    }
    return this._listsPromise ?? Promise.resolve();
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
