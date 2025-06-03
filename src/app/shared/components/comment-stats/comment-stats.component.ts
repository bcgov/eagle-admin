import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'app/services/api';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-comment-stats',
  templateUrl: './comment-stats.component.html',
  styleUrls: ['./comment-stats.component.scss']
})

export class CommentStatsComponent implements OnInit, OnDestroy {
  @Input() period: any;
  public summary: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.api.getPeriodSummary(this.period._id)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(summary => {
        this.summary = summary;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
