import { Component, OnInit, inject, ChangeDetectionStrategy, input, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-comment-stats',
    templateUrl: './comment-stats.component.html',
    styleUrl: './comment-stats.component.css',
    
})

export class CommentStatsComponent implements OnInit {
  private api = inject(CommentPeriodService);

  private destroyRef = inject(DestroyRef);

  period = input.required<any>();
  public summary: any;

  ngOnInit() {
    if (!this.period()?._id) {
      return;
    }
    this.api.getSummaryById(this.period()._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(summary => {
        this.summary = summary;
      });
  }
}
