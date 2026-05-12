import { Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrl: './map.component.css',
    
})
export class MapComponent {
}
