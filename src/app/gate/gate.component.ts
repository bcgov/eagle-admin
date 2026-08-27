import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GateService } from '../services/gate.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-gate',
  templateUrl: './gate.component.html',
  imports: [FormsModule]
})
export class GateComponent {
  private gate = inject(GateService);
  private keycloakService = inject(KeycloakService);
  private logger = inject(LoggingService);

  private passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

  public password = '';
  public busy = signal(false);
  public error = signal('');

  constructor() {
    afterNextRender(() => this.passwordInput().nativeElement.focus());
  }

  public async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      await this.gate.unlock(this.password);
      // Bootstrap skipped Keycloak while the curtain was up (see main.ts) — start it now so the
      // login redirect fires for a visitor who has just been let through.
      await this.keycloakService.init();
    } catch (err) {
      this.logger.error('gate unlock failed', 'GateComponent', err);
      this.error.set(err?.status === 401
        ? 'That password is not correct.'
        : 'The password could not be checked. Please try again.');
      this.busy.set(false);
    }
  }
}
