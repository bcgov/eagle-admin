import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, DebugElement } from '@angular/core';
import { ReviewCommentsComponent } from './review-comments.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { CommentService } from 'app/services/comment.service';
import { ExcelService } from 'app/services/excel.service';
import { ApiService } from 'app/services/api';
import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';
import { of, throwError } from 'rxjs';
import { SearchComponent } from 'app/search/search.component';
import { By } from '@angular/platform-browser';

@Component({ selector: 'app-comment-detail', template: '' })
class CommentDetailStubComponent {
  @Input() comment: Comment;
}

describe('ReviewCommentsComponent', () => {
  let component: ReviewCommentsComponent;
  let fixture: ComponentFixture<ReviewCommentsComponent>;
  const commentPeriod = new CommentPeriod({ _id: 'COMMENT_PERIOD_ID' });
  const existingApplication = new Application({
    _id: 'APPLICATION_ID',
    currentPeriods: commentPeriod
  });
  const validRouteData = { application: existingApplication };

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);
  const firstComment = new Comment({
    _id: 'FIRST_COMMENT',
    name: 'Zebras are great'
  });
  const secondComment = new Comment({
    _id: 'SECOND_COMMENT',
    name: 'Apples are tasty'
  });
  let comments = [firstComment, secondComment];
  let sortSelector: HTMLSelectElement;

  const commentServiceStub = {
    getCountByPeriodId() {
      return of(20);
    },

    getAllByApplicationId() {
      return of(comments);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule.withRoutes([
          { path: 'search', component: SearchComponent }
        ]),
        FormsModule
      ],
      declarations: [
        ReviewCommentsComponent,
        NewlinesPipe,
        CommentDetailStubComponent,
        SearchComponent
      ],
      providers: [
        { provide: CommentService, useValue: commentServiceStub },
        { provide: ExcelService },
        { provide: ApiService },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCommentsComponent);
    component = fixture.componentInstance;
    sortSelector = fixture.nativeElement.querySelector('.sort-comments');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the application is retrievable from the route', () => {
    let commentService;

    beforeEach(() => {
      activatedRouteStub.setData(validRouteData);
      commentService = TestBed.get(CommentService);
    });

    it('sets the component application to the one from the route', () => {
      expect(component.application).toEqual(existingApplication);
    });

    describe('pageCount', () => {
      it('calls the comment service with the applications current period id', () => {
        spyOn(commentService, 'getCountByPeriodId').and.callThrough();

        component.ngOnInit();

        expect(commentService.getCountByPeriodId).toHaveBeenCalledWith(
          'COMMENT_PERIOD_ID'
        );
      });

      it('pageCount is calculated by the number of comments divided by 20, rounded up', () => {
        spyOn(commentService, 'getCountByPeriodId').and.returnValue(of(199));

        component.ngOnInit();

        expect(component.pageCount).toEqual(10);
      });

      it('sets the pageCount to one if no number is returned by the comment service', () => {
        spyOn(commentService, 'getCountByPeriodId').and.returnValue(of(null));

        component.ngOnInit();

        expect(component.pageCount).toEqual(1);
      });
    });

    describe('comments', () => {
      it('calls the comment service with the correct parameters', () => {
        spyOn(commentService, 'getAllByApplicationId').and.callThrough();

        component.ngOnInit();

        let expectedPageNumber = 0;
        let expectedPageSize = 20;
        let expectedSortFilter = '-dateAdded';

        expect(commentService.getAllByApplicationId).toHaveBeenCalledWith(
          'APPLICATION_ID',
          expectedPageNumber,
          expectedPageSize,
          expectedSortFilter,
          { getDocuments: true }
        );
      });

      it('sets the component comments and the current comment', () => {
        expect(component.comments).toEqual(comments);
        expect(component.currentComment).toEqual(firstComment);
      });

      it('redirects to login if the commment service returns a 403', () => {
        let forbiddenError = { status: 403, message: 'Permission Denied!' };

        spyOn(commentService, 'getAllByApplicationId').and.returnValue(
          throwError(forbiddenError)
        );
        let navigateSpy = spyOn((<any>component).router, 'navigate');

        component.ngOnInit();

        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      });

      it('adds the error message to the alerts', () => {
        spyOn(commentService, 'getAllByApplicationId').and.returnValue(
          throwError('Houston we have a problem')
        );

        component.ngOnInit();

        expect(component.alerts).toContain('Error loading comments');
      });
    });

    describe('sorting', () => {
      it('pulls down new comments when the sort selection is changed', () => {
        spyOn(commentService, 'getAllByApplicationId').and.returnValue(
          of([secondComment, firstComment])
        );

        sortSelector.value = '%2BcontactName';
        sortSelector.dispatchEvent(new Event('change'));

        let expectedPageNumber = 0;
        let expectedPageSize = 20;
        let expectedSortFilter = '%2BcontactName';

        expect(commentService.getAllByApplicationId).toHaveBeenCalledWith(
          'APPLICATION_ID',
          expectedPageNumber,
          expectedPageSize,
          expectedSortFilter,
          { getDocuments: true }
        );

        expect(component.comments).toEqual([secondComment, firstComment]);
      });
    });

    describe('pagination', () => {
      let nextPage: DebugElement;
      let previousPage: DebugElement;

      beforeEach(() => {
        nextPage = fixture.debugElement.query(
          By.css('button[title="View Next Page"')
        );
        previousPage = fixture.debugElement.query(
          By.css('button[title="View Previous Page"')
        );
      });

      describe('when "View Next Page" is clicked', () => {
        it('pulls down the next 20 comments', done => {
          spyOn(commentService, 'getAllByApplicationId').and.returnValue(
            of([secondComment, firstComment])
          );

          component.pageNum = 2;

          fixture.whenStable().then(() => {
            nextPage.triggerEventHandler('click', null);

            // Comment service expects a zero-indexed page number, which is why the expected
            // page number is 2. 2 is actually the third page.
            let expectedPageNumber = 2;
            let expectedPageSize = 20;
            let expectedSortFilter = '-dateAdded';

            expect(commentService.getAllByApplicationId).toHaveBeenCalledWith(
              'APPLICATION_ID',
              expectedPageNumber,
              expectedPageSize,
              expectedSortFilter,
              { getDocuments: true }
            );

            done();
          });
        });
      });

      describe('when "View Previous Page" is clicked', () => {
        it('it pulls down the prior 20 comments', done => {
          spyOn(commentService, 'getAllByApplicationId').and.callThrough();

          component.pageNum = 2;

          fixture.whenStable().then(() => {
            previousPage.triggerEventHandler('click', null);

            // Comment service expects a zero-indexed page number, which is why the expected
            // page number is 0. 0 is the first page.
            let expectedPageNumber = 0;
            let expectedPageSize = 20;
            let expectedSortFilter = '-dateAdded';

            expect(commentService.getAllByApplicationId).toHaveBeenCalledWith(
              'APPLICATION_ID',
              expectedPageNumber,
              expectedPageSize,
              expectedSortFilter,
              { getDocuments: true }
            );
            done();
          });
        });
      });
    });
  });

  describe('when the application is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setData({ something: 'went wrong' });
    });

    it('redirects to /search', () => {
      let navigateSpy = spyOn((<any>component).router, 'navigate');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/search']);
    });
  });
});
