import { Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-metrics',
    templateUrl: './metrics.component.html',
    styleUrl: './metrics.component.css',
    
})
export class MetricsComponent {
  public data: any[] = null;
}
