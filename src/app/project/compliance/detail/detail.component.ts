import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Compliance } from 'app/models/compliance';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-compliance-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class ComplianceDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Compliance = null;
  public currentProject: Project = null;
  public publishText: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
  ) {
  }

  async ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.compliance.data;
        let self = this;

        // TODO
        // Change this to download each item separately and then push the thumb into it's spot on the page
        // appropriately
        // this.api.downloadElementResource('5d5f6a5979348a3e48673537')
        // .then(async function(item) {
          self.document.elements.map(async z => {
            // self._changeDetectionRef.detectChanges();
            if (z.type === 'photo') {
              // Show thumb
              let resource = await self.api.downloadElementThumbnail(z._id);
              const reader = new FileReader();
              reader.readAsDataURL(resource);
              reader.onloadend = function() {
                // result includes identifier 'data:image/png;base64,' plus the base64 data
                z.src = reader.result;
                self._changeDetectionRef.detectChanges();
              };
            } else if (z.type === 'video') {
              // Show it's type with a clickable event.
            } else if (z.type === 'voice') {
              // Show it's type with a clickable event.
            } else if (z.type === 'text') {
              // Show it's type with a clickable event.
            }
          });
        });
      // });

  }

  download(item) {
    // console.log('Package Download?:', item);
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
