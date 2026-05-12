import { Component, inject, ChangeDetectionStrategy} from '@angular/core';

import { SideBarService } from '../services/sidebar.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.css',
})

export class ToggleButtonComponent {

  public loading = true;
  public classApplied = false;

  private sidebarService = inject(SideBarService);

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }

}
