import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { container } from '@angular/core/src/render3/instructions';

import { SideBarService } from 'app/services/sidebar.service';
import { filter } from 'rxjs/operators';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {
  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';
  public currentMenu = '';

  @HostBinding('class.is-toggled')
  isOpen = false;

  constructor(private router: Router,
              private storageService: StorageService,
              private sideBarService: SideBarService) {

    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
    });
  }

  ngOnInit() {
    this.sideBarService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  SetActiveSidebarItem() {
    let urlArray =  this.routerSnapshot.url.split('/');
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    if (urlArray[0] === 'p') {
      switch (urlArray[2]) {
        case 'compliance': {
          break;
        }
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
}
