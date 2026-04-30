import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api';
import { Subscription } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggingService } from '../services/logging.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      RouterModule
    ]
})

export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(ApiService);
  private keycloakService = inject(KeycloakService);
  private logger = inject(LoggingService);

  private subscriptions = new Subscription();
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

    this.subscriptions.add(
      this.api.login(this.model.username, this.model.password)
        .subscribe(
          result => {
            if (result === true) {
              // login successful
              this.router.navigate(['/']);
            }
          },
          error => {
            this.logger.error('login failed', 'LoginComponent', error);
            this.error = 'Username or password is incorrect';
            this.loading = false;
          }
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
