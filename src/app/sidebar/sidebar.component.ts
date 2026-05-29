import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef} from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeycloakService } from '../services/keycloak.service';
import { SideBarService } from '../services/sidebar.service';
import { StorageService } from '../services/storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  host: { '[class.is-toggled]': 'isOpen' },
  imports: [
    RouterModule,
  ],
})

export class SidebarComponent implements OnInit {
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

  isOpen = false;
  isArchive = false;

  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private keycloakService = inject(KeycloakService);
  private sideBarService = inject(SideBarService);
  private _changeDetectionRef = inject(ChangeDetectorRef);

  constructor() {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(event => {
        this.routerSnapshot = event ?? { urlAfterRedirects: this.router.url };
        this.SetActiveSidebarItem();
        this._changeDetectionRef.markForCheck();
      });
  }

  ngOnInit() {
    this.sideBarService.archiveChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isArchive => {
        this.isArchive = isArchive;
        this._changeDetectionRef.markForCheck();
      });

    this.sideBarService.toggleChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        this._changeDetectionRef.markForCheck();
      });

    let roles: string[] = [];
    try {
      roles = this.keycloakService.getUserRoles() || [];
    } catch {
      roles = [];
    }
    if (roles.includes('inspector')) {
      this.isInspectorRole = true;
    }
  }

  /**
   * Sets the active menu item in the sibebar.
   */
  SetActiveSidebarItem() {
    const urlArray = this.routerSnapshot.urlAfterRedirects.split('/');
    urlArray.shift(); // remove leading empty segment

    const [mainRoute, mainRouteId] = urlArray.map(s => s.split(';')[0]);

    this.showProjectDetails = mainRoute === 'p';
    this.showProjectNotificationDetails = mainRoute === 'pn';
    this.mainRouteId = (mainRoute === 'p' || mainRoute === 'pn') ? mainRouteId : mainRoute;

    if (mainRoute === 'p') {
      this.currentProjectId = mainRouteId;
      try {
        const segment = urlArray[2].split(';')[0];
        // 'cp' is comment-period detail subroute; map to parent nav item
        this.currentMenu = segment === 'cp' ? 'comment-periods' : segment;
      } catch {
        this.currentMenu = '';
      }
    } else {
      this.currentProjectId = mainRoute;
      this.currentMenu = urlArray[2] ? urlArray[2].split(';')[0] : '';
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

}

