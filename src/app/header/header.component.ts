import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api';
import { JwtUtil } from 'app/jwt-util';
import { KeycloakService } from 'app/services/keycloak.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';

import { DayCalculatorModalComponent } from 'app/day-calculator-modal/day-calculator-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DayCalculatorModalResult } from 'app/day-calculator-modal/day-calculator-modal.component';
import { Subject } from 'rxjs/Subject';

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
  public isNavMenuOpen = false;
  public welcomeMsg: String;
  public jwt: {
    username: String,
    realm_access: {
      roles: Array<String>
    }
    scopes: Array<String>
  };
  private dayCalculatorModal: NgbModalRef = null;
  public showDayCalculatorModal = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private api: ApiService,
    private dialogService: DialogService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    public router: Router
  ) {
    router.events
      .takeUntil(this.ngUnsubscribe)
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
      });
  }

  ngOnInit() {
    // Make sure they have the right role.
    if (!this.keycloakService.isValidForSite()) {
      this.router.navigate(['/not-authorized']);
    }

    let isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Browser Incompatible',
          message: '<strong>  Attention: </strong>This website is not supported by Internet Explorer and Microsoft Edge, please use Google Chrome or Firefox.',
          okOnly: true,
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        });
    }

    // Set the environment
    switch (this.api.env) {
      case 'local':
        this.envName = 'Local';
        break;
      case 'dev':
        this.envName = 'Development';
        break;
      case 'test':
        this.envName = 'Testing';
        break;
      case 'demo':
        this.envName = 'Demo';
        break;
      case 'hotfix':
        this.envName = 'Hotfix';
        break;
      default:
        this.envName = null;
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

  renderMenu(route: String) {
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
