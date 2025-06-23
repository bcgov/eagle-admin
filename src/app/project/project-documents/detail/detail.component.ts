import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from 'src/app/models/project';
import { ApiService } from 'src/app/services/api';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;
  public currentProject: Project = null;
  public publishText: string;
  formatBytes: (bytes: any, decimals?: number) => string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private utils: Utils,
    private documentService: DocumentService,
  ) {
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.formatBytes = this.utils.formatBytes;
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.document;
        if (this.document.read.includes('public')) {
          this.publishText = 'Unpublish';
        } else {
          this.publishText = 'Publish';
        }
        this._changeDetectionRef.detectChanges();
      });
  }

  onEdit() {
    this.storageService.state.selectedDocs = [this.document];
    this.storageService.state.labels = this.document.labels;
    this.storageService.state.back = { url: ['/p', this.document.project, 'project-documents', 'detail', this.document._id], label: 'View Document' };
    this.router.navigate(['p', this.document.project, 'project-documents', 'edit']);
  }

  togglePublish() {
    if (this.publishText === 'Publish') {
      this.documentService.publish(this.document._id).subscribe(
        () => { },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t update document');
        },
        () => {
          this.openSnackBar('This document has been published.', 'Close');
        }
      );
      this.publishText = 'Unpublish';
    } else {
      this.documentService.unPublish(this.document._id).subscribe(
        () => { },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t update document');
        },
        () => {
          this.openSnackBar('This document has been unpublished.', 'Close');
        }
      );
      this.publishText = 'Publish';
    }
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
