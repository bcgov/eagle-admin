import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ConfigService } from './services/config.service';
import { SideBarService } from 'app/services/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  @HostBinding('class.sidebarcontrol')
  isOpen = false;

  constructor(
    private configService: ConfigService,
    private sideBarService: SideBarService
  ) { }

  ngOnInit() {
    this.configService.init();
    this.sideBarService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnDestroy() {
    this.configService.destroy();
  }
}
