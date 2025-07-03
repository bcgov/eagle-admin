import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommentPeriod } from '../models/commentPeriod';
import { StorageService } from '../services/storage.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { CommentPeriodDetailsTabComponent } from '../comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { ReviewCommentsTabComponent } from '../comment-period/review-comments-tab/review-comments-tab.component';

@Component({
    selector: 'app-comment-period',
    templateUrl: './comment-period.component.html',
    styleUrls: ['./comment-period.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      MatTabsModule,
      CommentPeriodDetailsTabComponent,
      ReviewCommentsTabComponent,
    ]
})

export class CommentPeriodComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storageService = inject(StorageService);


  private subscriptions = new Subscription();

  public commentPeriod: CommentPeriod;
  public loading = true;
  public currentProject;
  public baseRouteUrl: string;
  public selectedTab = 0;

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProjectNotification' ? '/pn' : '/p';
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;

    if (this.storageService.state.selectedTab !== null) {
      this.selectedTab = this.storageService.state.selectedTab;
    }

    // get data from route resolver
    if (this.storageService.state.currentCommentPeriod == null) {
      this.subscriptions.add(
        this.route.data
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
          )
      );
    } else {
      this.commentPeriod = this.storageService.state.currentCommentPeriod.data;
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
