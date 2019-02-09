import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { container } from '@angular/core/src/render3/instructions';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {

  public routerSnapshot = null;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';

  constructor(router: Router) {
    router.events.filter((event: any) => event instanceof NavigationEnd)
        .subscribe(event => {
            this.routerSnapshot = event;
            this.SetActiveSidebarItem();
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
        case 'project-contracts': {
          break;
        }
        case 'comment-periods': {
          // TODO: set active subheading to comment periods.
          console.log('This is comment period');
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
      this.showProjectDetails = true;
    } else {
      this.showProjectDetails = false;
    }
  }

  toggleDropdown() {
    this.showProjectDetailsSubItems = !this.showProjectDetailsSubItems;
  }
}
