import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'app/models/project';
import { Subject } from 'rxjs';
import { SideBarService } from 'app/services/sidebar.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public project: Project = null;
  public loading = true;
  public classApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private sidebarService: SideBarService,
    private storageService: StorageService
  ) {
  }

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.project = data.project;
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            this.loading = false;
            this._changeDetectorRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }
}
