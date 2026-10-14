import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { formatBytes } from 'src/app/shared/utils/utils';
import { DemiDocument } from 'src/app/models/demi/document';
import { eagleWriteId } from 'src/app/models/demi/demi-ids';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, NgbDropdownModule, DatePipe],
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

  // Parent route (p/:projId) resolver populates StorageService before this component initializes,
  // for both direct URL loads and in-app navigation. Signal captures the value at construction time.
  public readonly project = signal<any>(this.storageService.currentProjectData);
  resolvedDocument = input.required<DemiDocument>();

  public readonly published = signal(false);
  /** Eagle id the publish and edit writes need; null for a DEMI-only row. */
  public readonly writeId = computed(() => eagleWriteId(this.resolvedDocument()));
  public readonly fileSize = computed(() => {
    const size = this.resolvedDocument().fileSize;
    return formatBytes(size == null || size === '' ? null : Number(size));
  });

  ngOnInit() {
    this.published.set(this.resolvedDocument().isPublished === true);
  }

  onEdit() {
    const doc = this.resolvedDocument();
    const projId = this.project()._id;
    this.storageService.state.selectedDocs = [doc];
    this.storageService.state.back = { url: ['/p', projId, 'project-documents', 'detail', doc.id], label: 'View Document' };
    this.router.navigate(['p', projId, 'project-documents', 'edit']);
  }

  /** Opens a published file in a new tab. The navigation carries no bearer, so DEMI serves it only when public. */
  openDocument() {
    const id = encodeURIComponent(this.resolvedDocument().id);
    window.open(`${this.configService.getDemiApiPath()}/documents/${id}/download?inline=1`, '_blank', 'noopener');
  }

  downloadDocument() {
    this.documentService.downloadNative(this.resolvedDocument().id);
  }

  togglePublish() {
    const id = this.writeId();
    if (!id) {
      return;
    }
    const publish = !this.published();
    const write = publish ? this.documentService.publish(id) : this.documentService.unPublish(id);
    write.subscribe({
      error: error => {
        this.logger.error(`${publish ? 'publish' : 'unpublish'} document failed`, 'DocumentDetailComponent', error);
        this.published.set(!publish);
        this.toastService.error('Could not update the document.');
      },
      complete: () => {
        this.toastService.success(`This document has been ${publish ? 'published' : 'unpublished'}.`);
      }
    });
    this.published.set(publish);
  }
}
