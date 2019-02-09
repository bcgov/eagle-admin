import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { SearchService } from 'app/services/search.service';
import { SearchTerms } from 'app/models/search';
import { Project } from 'app/models/project';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public searching = false;
  public ranSearch = false;
  public keywords: Array<string> = [];
  public projects: Array<Project> = [];
  public count = 0; // for template
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe = new Subject<boolean>();

  constructor(
    public snackBar: MatSnackBar,
    public searchService: SearchService, // also used in template
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // get search terms from route
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        if (params.keywords) {
          // remove empty and duplicate items
          this.terms.keywords = _.uniq(_.compact(params.keywords.split(','))).join(' ');
        }

        if (!_.isEmpty(this.terms.getParams())) {
          this.doSearch();
        }
      });
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private doSearch() {
    this.searching = true;
    this.count = 0;
    this.keywords = this.terms.keywords && _.uniq(_.compact(this.terms.keywords.split(' '))) || []; // safety checks
    this.projects.length = 0; // empty the list

    // this.searchService.getAppsByClidDtid(this.keywords)
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     projects => {
    //       projects.forEach(project => {
    //         // add if not already in list
    //         if (!_.find(this.projects, app => { return app.tantalisID === project.tantalisID; })) {
    //           this.projects.push(project);
    //         }
    //       });
    //       this.count = this.projects.length;
    //     },
    //     error => {
    //       console.log('error =', error);

    //       // update variables on error
    //       this.searching = false;
    //       this.ranSearch = true;

    //       this.snackBarRef = this.snackBar.open('Error searching projects ...', 'RETRY');
    //       this.snackBarRef.onAction().subscribe(() => this.onSubmit());
    //     },
    //     () => { // onCompleted
    //       // update variables on completion
    //       this.searching = false;
    //       this.ranSearch = true;
    //     });
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();

    // console.log('params =', params);
    this.router.navigate(['search', params]);
  }

  public onImport(project: Project) {
    if (project) {
      // save project data from search results
      const params = {
        // initial data
        // purpose: project.purpose,
        // subpurpose: project.subpurpose,
        // type: project.type,
        // subtype: project.subtype,
        // status: project.status,
        // tenureStage: project.tenureStage,
        // location: project.location,
        // businessUnit: project.businessUnit,
        // cl_file: project.cl_file,
        // tantalisID: project.tantalisID,
        // legalDescription: project.legalDescription,
        // client: project.client
      };
      // go to add-edit page
      this.router.navigate(['/a', 0, 'edit'], { queryParams: params });
    } else {
      console.log('error, invalid project =', project);
      this.snackBarRef = this.snackBar.open('Error creating project ...', null, { duration: 3000 });
    }
  }

}
