import { Injectable, Injector, inject, signal, computed } from '@angular/core';
import { ReplaySubject, firstValueFrom, forkJoin } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoggingService } from './logging.service';
import { LoadingStateService } from './loading-state.service';
import { DemiApiService } from './demi-api.service';
import { List } from '../models/demi/list';

// Lists load before sign-in finishes, and DEMI caps anonymous pages at 100 rows.
const LISTS_PAGE_SIZE = 100;
// DEMI /config is DEMI's own console config; only these keys are taken from it.
const KEYCLOAK_KEYS = ['KEYCLOAK_URL', 'KEYCLOAK_REALM'] as const;
// /config/public is the public site's document; the admin shares only these values with it.
const SITE_KEYS = ['BANNER_COLOUR', 'EAGLE_ANALYTICS_URL', 'APPINSIGHTS_CONNECTION_STRING'] as const;
const CONFIG_TIMEOUT_MS = 5000;

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
  CENTRE_API_URL?: string;
  REDIRECT_KEY?: string;
  APPINSIGHTS_CONNECTION_STRING?: string;
}

// env.js sets window.__env before Angular loads
declare global {
  interface Window { __env: EnvConfig; }
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, { signal: AbortSignal.timeout(CONFIG_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function pick(source: EnvConfig, keys: readonly (keyof EnvConfig)[]): EnvConfig {
  return Object.fromEntries(keys.filter(key => source[key] != null).map(key => [key, source[key]]));
}

/**
 * env.js holds test values with configEndpoint true; DEMI /config/public and /config merge over them.
 * The app calls relative /api, never API_LOCATION.
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
      this.logger.info('Fetching remote configuration from DEMI', 'ConfigService');
      await this.fetchRemoteConfig();
    }

    this.configLoaded = true;
    // Kick off list load in background — overlaps with Keycloak init.
    // Fire-and-forget; ensureListsLoaded() is idempotent.
    this.ensureListsLoaded();
  }

  private async fetchRemoteConfig(): Promise<void> {
    const base = this.getDemiApiPath();
    const [site, keycloak] = await Promise.all([
      this.fetchSiteConfig(`${base}/config/public`),
      this.fetchKeycloakConfig(`${base}/config`)
    ]);
    this._config.set({ ...this._config(), ...site, ...keycloak });
    this.logger.debug('merged with DEMI config:', 'ConfigService', this._config());
  }

  /**
   * Throws on transport failure or an answer with no Keycloak URL/realm, so a misrouted request
   * cannot boot a prod admin on env.js's test Keycloak.
   */
  private async fetchKeycloakConfig(url: string): Promise<EnvConfig> {
    const body: EnvConfig = await fetchJson(url);
    if (!body.KEYCLOAK_URL || !body.KEYCLOAK_REALM) {
      throw new Error(`ConfigService: ${url} returned no KEYCLOAK_URL/REALM`);
    }
    return pick(body, KEYCLOAK_KEYS);
  }

  /** Not fatal: on failure the admin boots on env.js values for the site keys. */
  private async fetchSiteConfig(url: string): Promise<EnvConfig> {
    try {
      return pick(await fetchJson(url), SITE_KEYS);
    } catch (e) {
      this.logger.warn(`${url} unavailable, using env.js values`, 'ConfigService', e);
      return {};
    }
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
