import { Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideBarService } from '../services/sidebar.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrl: './project.component.css',
    imports: [RouterModule],
})
export class ProjectComponent {
  private sidebarService = inject(SideBarService);

  // Resolved by projectResolver — available before component renders
  project = input.required<any>();

  public classApplied = false;

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }
}
