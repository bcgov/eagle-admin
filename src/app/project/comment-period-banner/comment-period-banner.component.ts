import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-comment-period-banner',
  imports: [DatePipe],
  templateUrl: './comment-period-banner.component.html',
  styleUrl: './comment-period-banner.component.css',
})
export class CommentPeriodBannerComponent implements OnInit {
  private router = inject(Router);
  private storageService = inject(StorageService);

  public commentPeriod;
  public projectId;

  ngOnInit() {
    this.projectId = this.storageService.currentProjectData._id;
    this.commentPeriod = this.storageService.currentProjectData.commentPeriodForBanner || null;
  }

  goToViewComments() {
    if (this.commentPeriod.isMet && this.commentPeriod.metURLAdmin) {
      window.open(this.commentPeriod.metURLAdmin, '_blank');
    } else {
      this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'comment-period-details']);
    }
  }

  goToAddComment() {
    this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'add-comment']);
  }
}
