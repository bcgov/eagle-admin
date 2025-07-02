import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-not-authorized',
    templateUrl: './not-authorized.component.html',
    styleUrls: ['./not-authorized.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class NotAuthorizedComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public loggedout = false;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.route.queryParamMap
        .subscribe(paramMap => {
          this.loggedout = paramMap.get('loggedout') === 'true';
        })
    );
  }

  login() {
    window.location.href = window.location.origin + '/admin/search';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
