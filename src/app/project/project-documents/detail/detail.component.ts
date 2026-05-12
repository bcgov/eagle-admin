import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { formatBytes } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, NgbDropdownModule],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.css',
})
export class DocumentDetailComponent implements OnInit {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);
  private logger = inject(LoggingService);
  private documentService = inject(DocumentService);
  private configService = inject(ConfigService);

  // Resolved via documentResolver + projectResolver (withComponentInputBinding)
  project = input<any>();
  resolvedDocument = input.required<Document>();

  public readonly publishText = signal<string>('Publish');
  public readonly formatBytes = formatBytes;

  // Lists signal from ConfigService — updates reactively when lists load
  private readonly lists = this.configService.listsSignal;

  // Resolved metadata fields — recompute whenever document or lists change
  public readonly resolvedType = computed(() => this.resolveListItem(this.resolvedDocument()?.type));
  public readonly resolvedAuthor = computed(() => this.resolveListItem(this.resolvedDocument()?.documentAuthorType));
  public readonly resolvedMilestone = computed(() => this.resolveListItem(this.resolvedDocument()?.milestone));
  public readonly resolvedProjectPhase = computed(() => this.resolveListItem(this.resolvedDocument()?.projectPhase));

  private resolveListItem(id: string | null | undefined): string {
    if (!id) return '-';
    const item = this.lists().find((i: any) => i._id === id);
    return item ? item.name : '-';
  }

  ngOnInit() {
    this.publishText.set(this.resolvedDocument()?.read?.includes('public') ? 'Unpublish' : 'Publish');
    this.configService.ensureListsLoaded();
  }

  onEdit() {
    const doc = this.resolvedDocument();
    this.storageService.state.selectedDocs = [doc];
    this.storageService.state.labels = doc.labels;
    this.storageService.state.back = { url: ['/p', doc.project, 'project-documents', 'detail', doc._id], label: 'View Document' };
    this.router.navigate(['p', doc.project, 'project-documents', 'edit']);
  }

  togglePublish() {
    const doc = this.resolvedDocument();
    if (this.publishText() === 'Publish') {
      this.documentService.publish(doc._id).subscribe(
        null,
        error => {
          this.logger.error('publish document failed', 'DocumentDetailComponent', error);
          alert('Uh-oh, couldn\'t update document');
        },
        () => {
          this.toastService.success('This document has been published.');
        }
      );
      this.publishText.set('Unpublish');
    } else {
      this.documentService.unPublish(doc._id).subscribe(
        null,
        error => {
          this.logger.error('unpublish document failed', 'DocumentDetailComponent', error);
          alert('Uh-oh, couldn\'t update document');
        },
        () => {
          this.toastService.success('This document has been unpublished.');
        }
      );
      this.publishText.set('Publish');
    }
  }

}
