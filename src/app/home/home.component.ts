import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ProjectService } from 'app/services/project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  public numProjects: number = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    // although we aren't currently using numProjects,
    // this verifies our login token and redirects in case of error
    this.projectService.getCount()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        value => {
          this.numProjects = value;
        },
        () => {
          console.log('error = could not count projects');
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
