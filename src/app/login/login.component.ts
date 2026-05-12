import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [
      FormsModule,
      RouterModule
    ]
})

export class LoginComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);
  private keycloakService = inject(KeycloakService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);
  model: any = {};
  loading = false;
  error = '';

  ngOnInit() {
    // Redir to the main index page if they try to get here.
    if (this.keycloakService.keycloakEnabled) {
      this.router.navigate(['/']);
    }
  }

  login() {
    this.loading = true;

    this.api.login(this.model.username, this.model.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        result => {
          if (result === true) {
            this.router.navigate(['/']);
          }
        },
        error => {
          this.logger.error('login failed', 'LoginComponent', error);
          this.error = 'Username or password is incorrect';
          this.loading = false;
        }
      );
  }
}
