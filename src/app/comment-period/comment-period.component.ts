import { Component, OnInit, input, inject, ChangeDetectionStrategy} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommentPeriod } from '../models/commentPeriod';
import { StorageService } from '../services/storage.service';
import { DatePipe } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentPeriodDetailsTabComponent } from '../comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { ReviewCommentsTabComponent } from '../comment-period/review-comments-tab/review-comments-tab.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-comment-period',
    templateUrl: './comment-period.component.html',
    styleUrl: './comment-period.component.css',
    imports: [
      DatePipe,
      RouterModule,
      NgbNavModule,
      CommentPeriodDetailsTabComponent,
      ReviewCommentsTabComponent,
    ]
})

export class CommentPeriodComponent implements OnInit {
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  project = input.required<any>();
  commentPeriod = input.required<CommentPeriod>();

  public baseRouteUrl: string;
  public selectedTab = 0;

  ngOnInit() {
    this.baseRouteUrl = this.route.snapshot.paramMap.has('projId') ? '/p' : '/pn';
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;

    if (this.storageService.state.selectedTab !== null) {
      this.selectedTab = this.storageService.state.selectedTab;
    }
  }

}
