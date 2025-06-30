import { Component } from '@angular/core';

@Component({
    selector: 'app-metrics',
    templateUrl: './metrics.component.html',
    styleUrls: ['./metrics.component.scss'],
    standalone: false
})
export class MetricsComponent {
  public data: any[] = null;
}
