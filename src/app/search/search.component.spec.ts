import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';
import { OrgService } from '../services/org.service';
import { SearchService } from '../services/search.service';
import { ToastService } from '../services/toast.service';

describe('SearchComponent sort from URL', () => {
  let getSearchResults: jasmine.Spy;

  function load(routeParams: object) {
    getSearchResults = jasmine.createSpy('getSearchResults')
      .and.returnValue(of([{ data: { meta: [], searchResults: [] } }]));
    TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
        { provide: SearchService, useValue: { getSearchResults } },
        { provide: OrgService, useValue: { getByCompanyType: () => of([]) } },
        { provide: ConfigService, useValue: { lists: [] } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    // No detectChanges: the load path runs from ngOnInit and needs no rendered template.
    TestBed.createComponent(SearchComponent).componentInstance.ngOnInit();
  }

  it('does not search when the URL holds only a sort', () => {
    load({ sortBy: '+displayName' });

    expect(getSearchResults).not.toHaveBeenCalled();
  });

  it('sends the sort from the URL with a keyword search', () => {
    load({ keywords: 'mine', sortBy: '+displayName' });

    expect(getSearchResults.calls.mostRecent().args[5]).toBe('+displayName');
  });
});
