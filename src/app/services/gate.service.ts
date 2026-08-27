import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ConfigService } from './config.service';

// sessionStorage, not localStorage: the curtain lifts for the tab, not forever.
const GATE_KEY = 'eagle-gate';

/**
 * Access curtain for non-production environments — the replacement for the shared nginx basic
 * auth credential. Keeps crawlers and stray visitors out of dev/test; Keycloak still gates the
 * admin app itself. The password is only ever checked by eagle-api.
 */
@Injectable({ providedIn: 'root' })
export class GateService {
  private api = inject(ApiService);
  private configService = inject(ConfigService);

  private unlocked = signal(this.readUnlocked());

  /** Closed only where the environment sets ACCESS_GATE and this tab has not answered yet. */
  public readonly open = computed(() => !this.configService.config().ACCESS_GATE || this.unlocked());

  /** Rejects with the HttpErrorResponse — status 401 means the password was wrong. */
  public async unlock(password: string): Promise<void> {
    await firstValueFrom(this.api.post<void>('public/gate', { password }));
    try {
      sessionStorage.setItem(GATE_KEY, '1');
    } catch {
      // Storage blocked (private browsing) — the curtain just comes back on reload.
    }
    this.unlocked.set(true);
  }

  private readUnlocked(): boolean {
    try {
      return sessionStorage.getItem(GATE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
