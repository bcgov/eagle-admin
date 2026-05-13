import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-metrics',
  imports: [DatePipe],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css',
})
export class MetricsComponent {
  public data: any[] = null;
}
