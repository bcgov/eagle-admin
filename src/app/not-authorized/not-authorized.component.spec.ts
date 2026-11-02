import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { NotAuthorizedComponent } from './not-authorized.component';

describe('NotAuthorizedComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'not-authorized', component: NotAuthorizedComponent }])],
    });
  });

  it('shows the logged-out message when the URL has loggedout=true', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/not-authorized?loggedout=true');

    expect(harness.routeNativeElement.querySelector('h1').textContent).toBe('Logged Out');
  });

  it('asks the user to email for access when the URL has no loggedout param', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/not-authorized');

    expect(harness.routeNativeElement.querySelector('h1').textContent).toBe('Email for access');
  });
});
