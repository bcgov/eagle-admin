import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommentPeriod } from 'app/models/commentperiod';

@Component({
  selector: 'app-comment-periods',
  templateUrl: './comment-periods.component.html',
  styleUrls: ['./comment-periods.component.scss']
})
export class CommentPeriodsComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public commentPeriods: CommentPeriod[] = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe(
      (data: { commentPeriods: CommentPeriod[] }) => {
        if (data.commentPeriods) {
          this.commentPeriods = data.commentPeriods;
        } else {
          alert('Uh-oh, couldn\'t load project');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      }
    );
  }
}
