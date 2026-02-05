import { Component, OnInit, HostBinding, inject } from '@angular/core';

import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { FooterComponent } from './footer/footer.component';
import { SideBarService } from './services/sidebar.service';
import { AnalyticsService } from './services/analytics/analytics.service';
import { KeycloakService } from './services/keycloak.service';

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
  private analyticsService = inject(AnalyticsService);
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  @HostBinding('class.sidebarcontrol')
  isOpen = false;

  ngOnInit() {
    this.sideBarService.toggleChange.subscribe(isOpen => {
      this.isOpen = isOpen;
    });

    // Initialize analytics (must be called after ConfigService.init())
    this.analyticsService.initialize();

    // Identify user for analytics if authenticated
    // This MUST be called before any page tracking to ensure userId is set
    if (this.keycloakService.isAuthenticated()) {
      const userGuid = this.keycloakService.getUserGuid();
      if (userGuid) {
        const sessionStart = new Date().toISOString();
        this.analyticsService.identify(userGuid, {
          username: this.keycloakService.getPreferredUsername(),
          roles: this.keycloakService.getUserRoles(),
          session_start: sessionStart,
          auth_provider: this.keycloakService.getIdpFromToken() || 'unknown'
        });
      }
    }

    // Track page views on navigation
    // These will only be sent AFTER identify() is called
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const routePath = event.urlAfterRedirects || event.url;
        const pageName = this.getPageName(routePath);
        this.analyticsService.page(pageName, { path: routePath });
      });
  }

  /** Extract page name from URL path */
  private getPageName(path: string): string {
    const cleanPath = path.split('?')[0].split('#')[0].split(';')[0];
    const routePath = cleanPath.replace(/^\/admin\/?/, '');
    
    if (!routePath || routePath === '/') return 'Home';
    
    return routePath
      .split('/')
      .filter(s => s && !s.match(/^[0-9a-f-]{20,}$/i)) // Remove IDs
      .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      .join(' > ') || 'Home';
  }
}
