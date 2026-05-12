import { Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideBarService } from '../services/sidebar.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-notification',
    imports: [RouterModule],
    templateUrl: './project-notification.component.html',
    styleUrl: './project-notification.component.css',
})
export class ProjectNotificationComponent {
  private sidebarService = inject(SideBarService);

  // Resolved by projectNotificationResolver — available before component renders
  project = input.required<any>();

  public classApplied = false;

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }
}
