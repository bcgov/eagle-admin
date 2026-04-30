import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService } from '../services/project.service';

import { RouterModule } from '@angular/router';
import { LoggingService } from '../services/logging.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [
    RouterModule
]
})

export class HomeComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private logger = inject(LoggingService);

  public numProjects: number = null;
  private subscriptions = new Subscription();

  ngOnInit() {
    // although we aren't currently using numProjects,
    // this verifies our login token and redirects in case of error
    this.subscriptions.add(
      this.projectService.getCount()
        .subscribe({
          next: value => {
            this.numProjects = value;
          },
          error: () => {
            this.logger.error('could not count projects', 'HomeComponent');
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
