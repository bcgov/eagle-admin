import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { SideBarService } from '../services/sidebar.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public isInspectorRole = false;
  public showNotificationProjects = false;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public showProjectNotificationDetails = false;
  public currentProjectId = '';
  public mainRouteId = '';
  public currentMenu = '';
  public showArchiveButton = false;

  @HostBinding('class.is-toggled')
  isOpen = false;
  isArchive = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private keycloakService: KeycloakService,
    private sideBarService: SideBarService,
  ) {

    router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
      });
  }

  ngOnInit() {
    this.sideBarService.archiveChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isArchive => {
        this.isArchive = isArchive;
      });

    this.sideBarService.toggleChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });

    const roles = this.keycloakService.getUserRoles();
    if (roles !== null && roles.includes('inspector')) {
      this.isInspectorRole = true;
    }
  }

  /**
   * Sets the active menu item in the sibebar.
   */
  SetActiveSidebarItem() {
    const urlArray = this.routerSnapshot.url.split('/');

    // The first element will be empty, so shift in order to remove it.
    urlArray.shift();
    const [mainRoute, mainRouteId, currentMenu] = urlArray;
    console.log('SetActiveSidebarItem', urlArray, mainRoute, mainRouteId, currentMenu);
    this.mainRouteId = mainRouteId;
    console.log(mainRouteId);
    this.currentMenu = currentMenu && currentMenu.split(';')[0];

    switch (mainRoute) {
      case 'p':
        this.showProjectDetails = true;
        this.showProjectNotificationDetails = false;
        break;

      case 'pn':
        this.showProjectNotificationDetails = true;
        this.showProjectDetails = false;
        break;
      default:
        // There is now sub-menu so the main route ID becomes the main route. This is a root level page.
        this.mainRouteId = mainRoute;
        this.showProjectNotificationDetails = false;
        this.showProjectDetails = false;
    }
    if (urlArray[0] === 'p') {
      switch (urlArray[2]) {
        case 'project-updates': {
          break;
        }
        case 'project-groups': {
          break;
        }
        case 'project-pins': {
          break;
        }
        case 'project-documents': {
          break;
        }
        case 'comment-periods': {
          break;
        }
        case 'milestones': {
          break;
        }
        case 'project-archived-detail': {
          break;
        }
        default: {
          break;
        }
      }
      this.currentProjectId = urlArray[1];
      try {
        this.currentMenu = urlArray[2];
        this.currentMenu = urlArray[2].split(';')[0];
      } catch (e) {
        // When coming from search, it's blank.
      }
      this.showProjectDetails = true;
    } else {
      this.currentProjectId = urlArray[0];
      this.showProjectDetails = false;
    }
  }

  toggleDropdown() {
    this.showProjectDetailsSubItems = !this.showProjectDetailsSubItems;
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }

  goToDocuments(currentProjectId) {
    this.storageService.state.projectDocumentTableParams = null;
    this.router.navigate(['/p', currentProjectId, 'project-documents']);
  }

  goToPnDocuments(currentProjectId) {
    this.storageService.state.projectDocumentTableParams = null;
    this.router.navigate(['/pn', currentProjectId, 'project-notification-documents', { notificationProjectId: currentProjectId }]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
