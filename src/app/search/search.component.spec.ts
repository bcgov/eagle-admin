import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ApplicationService } from 'app/services/application.service';
import { SearchService } from 'app/services/search.service';
import { Application } from 'app/models/application';
import { of, throwError } from 'rxjs';
import { ActivatedRouteStub } from 'app/spec/helpers';
import { By } from '@angular/platform-browser';
import { tick } from '@angular/core/src/render3';
import { CommentPeriod } from 'app/models/commentperiod';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  const activatedRouteStub = new ActivatedRouteStub();
  let searchService: SearchService;
  let searchInput: HTMLSelectElement;
  let searchButton: DebugElement;
  let searchForm: DebugElement;

  const searchServiceStub = {
    getAppsByClidDtid(keys: string[]) {
      const applicationOne = new Application();
      const applicationTwo = new Application();
      return of([applicationOne, applicationTwo]);
    }
  };
  const snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
  const snackBarRef = jasmine.createSpyObj('MatSnackBarRef', [
    'onAction',
    'dismiss'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [
        { provide: MatSnackBar, useValue: snackbarSpy },
        { provide: SearchService, useValue: searchServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    searchInput = fixture.nativeElement.querySelector('#keywordInput');
    searchForm = fixture.debugElement.query(By.css('.search-form'));
    searchButton = fixture.debugElement.query(By.css('button[type="submit"]'));

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('route behavior', () => {
    describe('with no params in the route', () => {
      beforeEach(() => {
        searchService = TestBed.get(SearchService);
        activatedRouteStub.setParams({});
      });

      it('does not perform a search', () => {
        spyOn(searchService, 'getAppsByClidDtid').and.callThrough();

        component.ngOnInit();

        expect(searchService.getAppsByClidDtid).not.toHaveBeenCalled();
      });
    });

    describe('with multiple keywords in the route', () => {
      const urlParams = { keywords: '88888,99999', ms: '373' };
      beforeEach(() => {
        searchService = TestBed.get(SearchService);

        activatedRouteStub.setParams(urlParams);
      });

      it('performs a search with those keywords', () => {
        spyOn(searchService, 'getAppsByClidDtid').and.callThrough();
        component.ngOnInit();

        expect(searchService.getAppsByClidDtid).toHaveBeenCalledWith([
          '88888',
          '99999'
        ]);
      });
    });

    describe('with one keyword in the route', () => {
      const urlParams = { keywords: '88888', ms: '373' };

      beforeEach(() => {
        searchService = TestBed.get(SearchService);

        activatedRouteStub.setParams(urlParams);
      });

      it('performs a search with those keywords', () => {
        spyOn(searchService, 'getAppsByClidDtid').and.callThrough();

        component.ngOnInit();

        expect(searchService.getAppsByClidDtid).toHaveBeenCalledWith(['88888']);
      });

      it('sets the components applications to the results from the search service', () => {
        const applicationOne = new Application({
          _id: 'APP_ONE',
          tantalisID: 'TANT_ONE'
        });
        const applicationTwo = new Application({
          _id: 'APP_TWO',
          tantalisID: 'TANT_TWO'
        });

        spyOn(searchService, 'getAppsByClidDtid').and.returnValue(
          of([applicationOne, applicationTwo])
        );

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.applications).toEqual([
          applicationOne,
          applicationTwo
        ]);
        expect(component.count).toEqual(2);
      });

      it('does not add duplicate applications if they are already there', () => {
        const ogApplication = new Application({
          _id: 'APP_ONE',
          tantalisID: 'TANT_ONE'
        });
        const duplicateApplication = new Application({
          _id: 'APP_ONE',
          tantalisID: 'TANT_ONE'
        });

        spyOn(searchService, 'getAppsByClidDtid').and.returnValue(
          of([duplicateApplication])
        );

        component.ngOnInit();

        expect(component.applications).toEqual([ogApplication]);
        expect(component.count).toEqual(1);
      });

      it('renders an error if the search service throws one', () => {
        spyOn(searchService, 'getAppsByClidDtid').and.returnValue(
          throwError('Something went wrong!')
        );

        snackbarSpy.open.and.returnValue(snackBarRef);
        snackBarRef.onAction.and.returnValue(of({}));
        let navigateSpy = spyOn((<any>component).router, 'navigate');

        component.ngOnInit();

        expect(snackbarSpy.open).toHaveBeenCalledWith(
          'Error searching applications ...',
          'RETRY'
        );

        expect(navigateSpy).toHaveBeenCalledWith([
          'search',
          jasmine.anything()
        ]);
      });
    });
  });

  describe('searching', () => {
    beforeEach(() => {
      searchService = TestBed.get(SearchService);
    });
    // I was having trouble getting the items from the search input to actually
    // trigger a change and be sent to the url
    // TODO: update test to actually assert the term in the search input is reflected in the route.
    xit('refreshes the current route with the search params', done => {
      spyOn(searchService, 'getAppsByClidDtid').and.callThrough();

      fixture.whenStable().then(() => {
        let navigateSpy = spyOn((<any>component).router, 'navigate');
        searchInput.value = '77777';
        searchInput.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        searchForm.triggerEventHandler('ngSubmit', null);
        // searchButton.nativeElement.click();
        // searchForm.submit();

        // expect(searchService.getAppsByClidDtid).toHaveBeenCalledWith(['77777']);
        expect(navigateSpy).toHaveBeenCalledWith([
          'search',
          { ms: jasmine.anything() }
        ]);
        done();
      });
    });
  });

  describe('rendering', () => {
    const urlParams = { keywords: '88888', ms: '373' };
    const valemontCommentPeriod = new CommentPeriod({
      startDate: new Date(2018, 8, 29),
      endDate: new Date(2018, 11, 1)
    });

    const valemontApplication = new Application({
      _id: 'VALEMONT',
      tantalisID: 'TANT_VALEMONT',
      client: 'Mr Moneybags',
      purpose: 'Shred',
      subpurpose: 'Powder',
      appStatus: 'Application Under Review',
      cpStatus: 'Commenting Closed',
      currentPeriods: valemontCommentPeriod
    });

    const applicationTwo = new Application({
      _id: 'APP_TWO',
      tantalisID: 'TANT_TWO'
    });
    let searchTable: DebugElement;

    beforeEach(() => {
      searchService = TestBed.get(SearchService);

      activatedRouteStub.setParams(urlParams);
    });

    describe('with application results', () => {
      beforeEach(() => {
        spyOn(searchService, 'getAppsByClidDtid').and.returnValue(
          of([valemontApplication, applicationTwo])
        );
      });

      it('displays the application details on the page', () => {
        component.ngOnInit();

        fixture.detectChanges();

        searchTable = fixture.debugElement.query(
          By.css('.search-results table')
        );
        let firstApplicationRow = searchTable.query(By.css('.app-details'));
        expect(firstApplicationRow).toBeDefined();

        const firstAppRowEl = firstApplicationRow.nativeElement;

        expect(firstAppRowEl.textContent).toContain('TANT_VALEMONT');
        expect(firstAppRowEl.textContent).toContain('Mr Moneybags');
        expect(firstAppRowEl.textContent).toContain('Application Under Review');
        expect(firstAppRowEl.textContent).toContain('Shred / Powder');
      });

      // The "isCreated" property is set in search.service. I'm not entirely clear
      // on what it means, but it's pretty important. Maybe whether or not it exists in Tantalis?

      describe('when the application "isCreated" property is true', () => {
        beforeEach(() => {
          valemontApplication['isCreated'] = true;
        });

        it('renders the comment period status and number of comments', () => {
          valemontCommentPeriod.startDate = new Date(2018, 8, 29);
          valemontCommentPeriod.endDate = new Date(2018, 11, 1);

          valemontApplication['numComments'] = 200;

          component.ngOnInit();

          fixture.detectChanges();

          searchTable = fixture.debugElement.query(
            By.css('.search-results table')
          );
          let firstCommentDetailsRow = searchTable.query(
            By.css('.app-comment-details')
          );
          expect(firstCommentDetailsRow).toBeDefined();
          const firstCommentRowEl = firstCommentDetailsRow.nativeElement;

          expect(firstCommentRowEl.textContent).toContain('200 comments');
          expect(firstCommentRowEl.textContent).toContain('Commenting Closed');
          expect(firstCommentRowEl.textContent).toContain(
            'September 29, 2018 to December 1, 2018'
          );
        });

        it('renders the "Actions" button', () => {
          component.ngOnInit();

          fixture.detectChanges();

          searchTable = fixture.debugElement.query(
            By.css('.search-results table')
          );
          let firstButton = searchTable.query(By.css('button'));
          const firstButtonEl = firstButton.nativeElement;
          expect(firstButtonEl.textContent).toContain('Actions');
        });
      });

      describe('when the application "isCreated" property is false', () => {
        beforeEach(() => {
          valemontApplication['isCreated'] = false;
        });

        it('does not render commenting details', () => {
          component.ngOnInit();

          fixture.detectChanges();

          searchTable = fixture.debugElement.query(
            By.css('.search-results table')
          );
          let firstCommentDetailsRow = searchTable.query(
            By.css('.app-comment-details')
          );
          expect(firstCommentDetailsRow).toBeFalsy();
        });

        it('renders the "Create" button', () => {
          component.ngOnInit();

          fixture.detectChanges();

          searchTable = fixture.debugElement.query(
            By.css('.search-results table')
          );
          let firstButton = searchTable.query(By.css('button'));
          const firstButtonEl = firstButton.nativeElement;
          expect(firstButtonEl.textContent).toContain('Create');
        });
      });

      it('renders each application result on the page', () => {
        component.ngOnInit();

        fixture.detectChanges();

        searchTable = fixture.debugElement.query(
          By.css('.search-results table')
        );

        let appDetailsRows = searchTable.nativeElement.querySelectorAll(
          'tr.app-details'
        );
        expect(appDetailsRows.length).toBe(2);
      });
    });
  });
});
