import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  public numProjects: number = null;
  private subscriptions = new Subscription();

  constructor(
    private projectService: ProjectService
  ) { }

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
            console.log('error = could not count projects');
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
