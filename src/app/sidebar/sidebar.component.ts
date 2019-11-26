import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SideBarService } from 'app/services/sidebar.service';
import { filter } from 'rxjs/operators';
import { StorageService } from 'app/services/storage.service';
import { Subject } from 'rxjs/Subject';
import { KeycloakService } from 'app/services/keycloak.service';
import { ApiService } from 'app/services/api';

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
  public currentProjectId = '';
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
    private apiService: ApiService
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
      console.log("Printing isArchive");
      console.log(isArchive);
    });

    this.sideBarService.change
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });

    const roles = this.keycloakService.getUserRoles();
    if (roles.includes('inspector')) {
      this.isInspectorRole = true;
    }

    // Remove this when notification projects are ready.
    if (this.apiService.env === 'demo') {
      this.showNotificationProjects = true;
    }
  }

  SetActiveSidebarItem() {
    let urlArray = this.routerSnapshot.url.split('/');
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    if (urlArray[0] === 'p') {
      switch (urlArray[2]) {
        // case 'compliance': {
        //   break;
        // }
        case 'valued-components': {
          break;
        }
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
    this.router.navigate(['p', currentProjectId, 'project-documents']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
