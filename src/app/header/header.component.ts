import { Component, OnInit, inject, computed, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../confirm/confirm.component';
import { DayCalculatorModalComponent, DayCalculatorModalResult } from '../day-calculator-modal/day-calculator-modal.component';
import { ApiService } from '../services/api';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { JwtUtil } from '../shared/utils/jwt-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('toggleNav', [
      state('navClosed', style({
        height: '0',
      })),
      state('navOpen', style({
        height: '*',
      })),
      transition('navOpen => navClosed', [
        animate('0.2s')
      ]),
      transition('navClosed => navOpen', [
        animate('0.2s')
      ]),
    ]),
  ],
  imports: [RouterModule]
})

export class HeaderComponent implements OnInit {
  private api = inject(ApiService);
  private analyticsService = inject(AnalyticsService);
  private configService = inject(ConfigService);
  private keycloakService = inject(KeycloakService);
  private modalService = inject(NgbModal);
  router = inject(Router);

  // Reactive banner values - update when config changes
  public envName = computed(() => this.configService.config().ENVIRONMENT || 'local');
  public bannerColour = computed(() => this.configService.config().BANNER_COLOUR ?? 'red');
  public showBanner = computed(() => {
    const env = this.envName();
    const colour = this.bannerColour();
    const hasValidColor = !!colour && colour !== 'no-banner-colour-set';
    return env === 'local' || (!!env && hasValidColor);
  });

  public isNavMenuOpen = false;
  public welcomeMsg: string;
  public jwt: {
    username: string,
    realm_access: {
      roles: Array<string>
    }
    scopes: Array<string>
  };
  private dayCalculatorModal: NgbModalRef = null;
  public showDayCalculatorModal = false;
  private destroyRef = inject(DestroyRef);

  constructor() {
    const router = this.router;

    router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const token = this.keycloakService.getToken();
        // TODO: Change this to observe the change in the _api.token
        if (token) {
          const jwt = JwtUtil.decodeToken(token);
          this.welcomeMsg = jwt ? ('Hello ' + jwt.preferred_username) : 'Login';
          this.jwt = jwt;
        } else {
          this.welcomeMsg = 'Login';
          this.jwt = null;
        }
      });
  }

  ngOnInit() {
    // Make sure they have the right role.
    if (!this.keycloakService.isAuthenticated()) {
      this.router.navigate(['/not-authorized']);
    }

    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      const modalRef = this.modalService.open(ConfirmComponent);
      modalRef.componentInstance.title = 'Browser Incompatible';
      modalRef.componentInstance.message = '<strong>  Attention: </strong>This website is not supported by Internet Explorer and Microsoft Edge, please use Google Chrome or Firefox.';
      modalRef.componentInstance.okOnly = true;
    }
    // Banner values are now computed signals - no need to set here
  }

  openCalculator() {
    this.showDayCalculatorModal = true;
    this.dayCalculatorModal = this.modalService.open(DayCalculatorModalComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    this.dayCalculatorModal.result.then(result => {
      this.dayCalculatorModal = null;
      this.showDayCalculatorModal = false;
      // if user dismissed the modal or clicked Explore then load initial apps
      // otherwise user clicked Find, which will load filtered apps
      switch (result) {
        case DayCalculatorModalResult.Dismissed:
          // this.urlService.setFragment(null);
          // this.getApps();
          break;
        case DayCalculatorModalResult.Exploring:
          // this.getApps();
          break;
        case DayCalculatorModalResult.Finding:
          break;
      }
    });
    return;
  }

  renderMenu(route: string) {
    // Sysadmin's get administration.
    if (route === 'administration') {
      return (this.jwt && this.jwt.realm_access && this.jwt.realm_access.roles.find(x => x === 'sysadmin') && this.jwt.username === 'admin');
    }
  }

  navigateToLogout() {
    // Track session end and reset analytics state
    this.analyticsService.reset();
    // reset login status
    this.api.logout();
    window.location.href = this.keycloakService.getLogoutURL();
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }

}
