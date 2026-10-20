import { Injectable, Injector, inject, signal, computed } from '@angular/core';
import { ReplaySubject, firstValueFrom, forkJoin } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';
import { DemiApiService } from './demi-api.service';
import { List } from '../models/demi/list';

// Lists load before sign-in finishes, and DEMI caps anonymous pages at 100 rows.
const LISTS_PAGE_SIZE = 100;

interface EnvConfig {
  logLevel?: number;
  configEndpoint?: boolean;
  ENVIRONMENT?: string;
  BANNER_COLOUR?: string;
  API_PATH?: string;
  API_LOCATION?: string;
  DEMI_API_PATH?: string;
  KEYCLOAK_CLIENT_ID?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_ENABLED?: boolean;
  EAGLE_ANALYTICS_URL?: string | null;
  REDIRECT_KEY?: string;
  APPINSIGHTS_CONNECTION_STRING?: string;
}

// env.js sets window.__env before Angular loads
declare global {
  interface Window { __env: EnvConfig; }
}

/**
 * Local dev uses env.js as is; deployed builds (configEndpoint true) merge eagle-api's /api/config
 * over it, keeping env.js KEYCLOAK_CLIENT_ID. The app calls relative /api, never API_LOCATION.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private injector = inject(Injector);
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
  private _lists: List[] = [];
  // ReplaySubject(1) replays the latest lists to any new subscriber immediately.
  // toSignal() bridges it to Angular's signal graph — zone-safe, no manual detectChanges needed.
  private readonly _lists$ = new ReplaySubject<List[]>(1);
  public readonly listsSignal = toSignal(this._lists$, { initialValue: [] as List[] });
  private _listsPromise: Promise<void> | null = null;
  private _regions: any[] = [];

  /** Must be awaited: Keycloak init reads the merged config. */
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
   * Throws on transport failure or a payload with no Keycloak URL/realm:
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
          this._lists = await this.fetchAllLists();
          this.logger.debug(`Resolved ${this._lists.length} list items`, 'ConfigService');
          if (this._lists.length === 0) {
            throw new Error('DEMI returned no List rows');
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

  /** Every DEMI `List` row: page 1 asks for the total, the remaining pages load in parallel. */
  private async fetchAllLists(): Promise<List[]> {
    // Resolved on first call: DemiApiService injects ConfigService, so a field inject would be circular.
    const demi = this.injector.get(DemiApiService);
    const first = await firstValueFrom(demi.list<List>('lists', { page: 1, pageSize: LISTS_PAGE_SIZE, count: true }));
    if (first.total == null) {
      throw new Error('DEMI /lists answered without x-total-count');
    }
    const pageCount = Math.ceil(first.total / LISTS_PAGE_SIZE);
    if (pageCount <= 1) {
      return first.rows;
    }
    const rest = Array.from({ length: pageCount - 1 }, (_, i) => demi.list<List>('lists', { page: i + 2, pageSize: LISTS_PAGE_SIZE }));
    const pages = await firstValueFrom(forkJoin(rest));
    return [first.rows, ...pages.map(page => page.rows)].flat();
  }

  /**
   * Get the API path for making API calls.
   * Always relative — proxy.conf.js (local) or the Front Door /api/* route (deployed) handles routing.
   */
  public getApiPath(): string {
    return this._config().API_PATH || '/api';
  }

  /** Base path for DEMI native reads. Relative, same origin; the edge forwards it to DEMI. */
  public getDemiApiPath(): string {
    return this._config().DEMI_API_PATH || '/demi/api';
  }

  get isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  get lists(): List[] {
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
