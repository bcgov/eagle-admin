import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api';

@Component({
    selector: 'app-comment-stats',
    templateUrl: './comment-stats.component.html',
    styleUrls: ['./comment-stats.component.css'],
    
})

export class CommentStatsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  @Input() period: any;
  public summary: any;

  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.api.getPeriodSummary(this.period._id)
        .subscribe(summary => {
          this.summary = summary;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
