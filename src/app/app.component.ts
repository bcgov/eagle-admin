import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      CommonModule,
      RouterModule,
      HeaderComponent,
      SidebarComponent,
      ToggleButtonComponent,
      FooterComponent
    ]
})

export class AppComponent implements OnInit {

  @HostBinding('class.sidebarcontrol')
  isOpen = false;

  constructor(
    private sideBarService: SideBarService
  ) { }

  ngOnInit() {
    this.sideBarService.toggleChange.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }
}
