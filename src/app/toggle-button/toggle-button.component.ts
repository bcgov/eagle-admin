import { Component, inject } from '@angular/core';

import { SideBarService } from '../services/sidebar.service';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css'],
  standalone: true,
  imports: []
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
