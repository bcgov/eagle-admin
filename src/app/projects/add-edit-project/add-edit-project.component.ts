import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Subject } from 'rxjs';
import { Utils } from 'app/shared/utils/utils';
import { MatSnackBar } from '@angular/material';

import { StorageService } from 'app/services/storage.service';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from 'app/shared/components/contact-select-table-rows/contact-select-table-rows.component';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})
export class AddEditProjectComponent implements OnInit, OnDestroy {

  // order of items in this tabLinks array is important.
  public tabLinks = [
    // { label: '1996 Environmental Assessment Act', link: 'form-1996' },
    { label: '1996/2002 Environmental Assessment Acts', link: 'form-2002' },
    { label: '2018 Environmental Assessment Act', link: 'form-2018' },
  ];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public proponentName = '';
  public proponentId = '';

  public projectName;
  public projectId;
  public project;

  public isEditing = false;

  public loading = true;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private config: ConfigService,
    private _changeDetectorRef: ChangeDetectorRef,
    private utils: Utils,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.config.lists.map(item => {
      switch (item.type) {
        case 'region':
          this.regions.push(item.name);
          break;
      }
    });
    //
    this.route.url
      .subscribe(urls => {
        this.isEditing = urls.some(url => url.path === 'edit');
      });
    // Get data related to current project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        this.project = data.project;
        this.loading = false;
      });

    // hide tabs corresponding to old legislations on new projects
    if (!this.isEditing) {
      this.tabLinks = [this.tabLinks[this.tabLinks.length - 1]];
    }
    this.loading = false;
    this.back = this.storageService.state.back;
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  register(myForm: FormGroup) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
