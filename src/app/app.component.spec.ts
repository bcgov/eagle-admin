import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { AnalyticsService } from './services/analytics/analytics.service';
import { KeycloakService } from './services/keycloak.service';
import { SideBarService } from './services/sidebar.service';

// A body-container dropdown whose toggle sits inside a small scroll area,
// like the Actions menus inside .app-body.
@Component({
  imports: [NgbDropdownModule],
  template: `
    <div id="scroller" style="height: 100px; overflow: auto">
      <div ngbDropdown container="body">
        <button id="toggle" ngbDropdownToggle>Actions</button>
        <div id="menu" ngbDropdownMenu><button ngbDropdownItem>Edit</button></div>
      </div>
      <div style="height: 1000px"></div>
    </div>
  `
})
class ScrolledDropdownHostComponent { }

describe('AppComponent dropdown config', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SideBarService, useValue: {} },
        { provide: AnalyticsService, useValue: {} },
        { provide: KeycloakService, useValue: {} }
      ]
    });
    // Only the constructor matters here: it configures NgbDropdownConfig for every dropdown created after it.
    TestBed.runInInjectionContext(() => new AppComponent());
  });

  it('hides a body-appended menu once its toggle is scrolled out of view', async () => {
    const fixture = TestBed.createComponent(ScrolledDropdownHostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#toggle').click();
    fixture.detectChanges();
    await fixture.whenStable();

    // Popper re-positions from its own scroll listener, so wait for the real scroll event.
    const scroller: HTMLElement = fixture.nativeElement.querySelector('#scroller');
    const scrolled = new Promise(resolve => scroller.addEventListener('scroll', resolve, { once: true }));
    scroller.scrollTop = 500;
    await scrolled;
    await fixture.whenStable();

    expect(getComputedStyle(document.getElementById('menu')).visibility).toBe('hidden');
    fixture.destroy();
  });

  it('keeps the menu visible while its toggle is in view', async () => {
    const fixture = TestBed.createComponent(ScrolledDropdownHostComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('#toggle').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = document.getElementById('menu');
    expect(getComputedStyle(menu).visibility).toBe('visible');
    fixture.destroy();
  });
});
