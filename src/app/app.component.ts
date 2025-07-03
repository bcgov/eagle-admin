import { Component, OnInit, HostBinding, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarService } from './services/sidebar.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    ToggleButtonComponent,
    FooterComponent
]
})

export class AppComponent implements OnInit {
  private sideBarService = inject(SideBarService);


  @HostBinding('class.sidebarcontrol')
  isOpen = false;

  ngOnInit() {
    this.sideBarService.toggleChange.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }
}
