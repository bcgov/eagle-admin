import { ChangeDetectionStrategy, Component } from '@angular/core';

// Static on purpose: Eagle holds no Track id, so the note cannot be per project or link to Track.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-track-owned-fields-note',
  template: `
    <div class="alert alert-info d-flex align-items-start gap-2" role="note">
      <i class="material-icons" aria-hidden="true">info</i>
      <p class="mb-0">
        <strong>Managed in EPIC.track.</strong>
        For projects in EPIC.track, the public site shows the Project Name, Proponent, Type,
        Description and Location from EPIC.track. Changes made here are saved but not shown
        publicly. Edit these fields in EPIC.track; the public site updates within minutes.
      </p>
    </div>
  `,
})
export class TrackOwnedFieldsNoteComponent {}
