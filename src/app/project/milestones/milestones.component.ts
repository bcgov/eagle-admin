import { Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-milestones',
    imports: [RouterModule],
    templateUrl: './milestones.component.html',
    styleUrl: './milestones.component.css',
    
})
export class MilestonesComponent {
}
