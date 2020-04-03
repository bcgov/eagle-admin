import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { CommentPeriod } from 'app/models/commentPeriod';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-comment-period',
  templateUrl: './comment-period.component.html',
  styleUrls: ['./comment-period.component.scss']
})

export class CommentPeriodComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriod: CommentPeriod;
  public loading: Boolean = true;
  public currentProject;
  public baseRouteUrl: string;
  public selectedTab = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProjectNotification' ? '/pn' : '/p';
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentVCs = null;

    if (this.storageService.state.selectedTab !== null) {
      this.selectedTab = this.storageService.state.selectedTab;
    }

    // get data from route resolver
    if (this.storageService.state.currentCommentPeriod == null) {
      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (data) => {
            if (data.commentPeriod) {
              this.commentPeriod = data.commentPeriod;
              this.storageService.state.selectedDocumentsForCP = null;
            } else {
              alert('Uh-oh, couldn\'t load comment period ');
              // comment period not found --> navigate back to search
              this.router.navigate(['/search']);
            }
            this.loading = false;
          }
        );
    } else {
      this.commentPeriod = this.storageService.state.currentCommentPeriod.data;
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
