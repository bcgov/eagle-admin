import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { JwtUtil } from '../shared/utils/jwt-utils';

/** EPIC.centre's name for this app; centre-api answers 400 for a name it does not know. */
const CENTRE_APP_NAME = 'epic_public';

/**
 * Records the signed-in IDIR user's last access in EPIC.centre, which shows it on the EPIC.public tile.
 * Same request as @epic/centre-analytics, which is a React hook and so unusable here.
 */
@Injectable({ providedIn: 'root' })
export class CentreAccessService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private keycloakService = inject(KeycloakService);
  private logger = inject(LoggingService);

  /** Never rejects: a centre-api failure must not stop the app loading. */
  async recordAccess(): Promise<void> {
    const baseUrl = (this.configService.config().CENTRE_API_URL || '').replace(/\/+$/, '');
    const token = this.keycloakService.getToken();
    if (!baseUrl || !token) {
      return;
    }
    try {
      if (this.keycloakService.getIdpFromToken() !== this.keycloakService.idpHintEnum.IDIR) {
        return;
      }
      const jwt = JwtUtil.decodeToken(token);
      const userAuthGuid = jwt?.preferred_username || jwt?.sub;
      if (!userAuthGuid) {
        return;
      }
      // The token interceptor only signs eagle-api and DEMI paths, so this call sets its own header.
      await firstValueFrom(this.http.post(
        `${baseUrl}/api/eao-analytics`,
        { user_auth_guid: userAuthGuid, app_name: CENTRE_APP_NAME },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      ));
    } catch (e) {
      this.logger.warn('Could not record last access in EPIC.centre', 'CentreAccessService', e);
    }
  }
}
