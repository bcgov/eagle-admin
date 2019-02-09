import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  public loading = true;
  private paramMap: ParamMap = null;
  public showOnlyOpenApps: boolean;
  public projects: Array<Project> = [];
  public column: string = null;
  public direction = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // get optional query parameters
    this.route.queryParamMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(paramMap => {
        this.paramMap = paramMap;

        // set initial filters
        this.resetFilters();
      });

    // get data
    this.projectService.getAll({ getCurrentPeriod: false })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        projects => {
          this.loading = false;
          this.projects = projects;
          console.log(this.projects);
        },
        error => {
          this.loading = false;
          console.log(error);
          alert('Uh-oh, couldn\'t load projects');
          // projects not found --> navigate back to home
          this.router.navigate(['/']);
        }
      );
  }

  public showOnlyOpenAppsChange(checked: boolean) {
    this.showOnlyOpenApps = checked;
    this.saveFilters();
  }

  private saveFilters() {
    const params: Params = {};

    if (this.showOnlyOpenApps) {
      params['showOnlyOpenApps'] = true;
    }

    if (this.column && this.direction) {
      params['col'] = this.column;
      params['dir'] = this.direction;
    }

    // change browser URL without reloading page (so any query params are saved in history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  private resetFilters() {
    this.showOnlyOpenApps = (this.paramMap.get('showOnlyOpenApps') === 'true');
    this.column = this.paramMap.get('col'); // == null if col isn't present
    this.direction = +this.paramMap.get('dir'); // == 0 if dir isn't present
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sort(property: string) {
    this.column = property;
    this.direction = this.direction > 0 ? -1 : 1;
    this.saveFilters();
  }

  public showThisProj(item: Project) {
    if (!this.showOnlyOpenApps) {
      return !this.showOnlyOpenApps;
    } else {
      item.currentPeriods.forEach(period => {
        if (this.commentPeriodService.isOpen(period) || this.commentPeriodService.isNotStarted(period)) {
          return true;
        }
      });
    }
  }
}
