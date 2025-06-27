import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from '../confirm/confirm.component';
import { DayCalculatorModalComponent, DayCalculatorModalResult } from '../day-calculator-modal/day-calculator-modal.component';
import { JwtUtil } from '../jwt-util';
import { ApiService } from '../services/api';
import { KeycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
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
  ]
})

export class HeaderComponent implements OnInit, OnDestroy {
  public envName: string;
  public bannerColour: string;
  public showBanner = false;
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
  private readonly subscriptions = new Subscription();

  constructor(
    private api: ApiService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    public router: Router
  ) {
    this.subscriptions.add(router.events
      .subscribe(() => {
        const token = this.keycloakService.getToken();
        // TODO: Change this to observe the change in the _api.token
        if (token) {
          const jwt = new JwtUtil().decodeToken(token);
          this.welcomeMsg = jwt ? ('Hello ' + jwt.preferred_username) : 'Login';
          this.jwt = jwt;
        } else {
          this.welcomeMsg = 'Login';
          this.jwt = null;
        }
      }));
  }

  ngOnInit() {
    // Make sure they have the right role.
    if (!this.keycloakService.isValidForSite()) {
      this.router.navigate(['/not-authorized']);
    }

    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      const modalRef = this.modalService.open(ConfirmComponent);
      modalRef.componentInstance.title = 'Browser Incompatible';
      modalRef.componentInstance.message = '<strong>  Attention: </strong>This website is not supported by Internet Explorer and Microsoft Edge, please use Google Chrome or Firefox.';
      modalRef.componentInstance.okOnly = true;
    }
    this.envName = this.api.env;
    this.bannerColour = this.api.bannerColour;
    // no-banner-colour-set is the default if no banner colour is defined in the openshift environment variables.
    if (this.envName && this.bannerColour && this.bannerColour !== 'no-banner-colour-set') {
      this.showBanner = true;
    }
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
