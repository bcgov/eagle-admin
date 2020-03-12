import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router, ActivatedRoute } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Subject } from 'rxjs';
import { SearchTerms } from 'app/models/search';
import { CACTableRowsComponent } from 'app/project/project-cac/cac-table-rows/cac-table-rows.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { EnterCACEmailComponent } from 'app/project/project-cac/enter-cac-email/enter-cac-email.component';
import { ExcelService } from 'app/services/excel.service';
import { MatSnackBar } from '@angular/material';
import { ProjectService } from 'app/services/project.service';

@Component({
  selector: 'app-project-cac',
  templateUrl: './project-cac.component.html',
  styleUrls: ['./project-cac.component.scss']
})
export class ProjectCACComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public currentProject;
  public loading = true;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public selectedCount = 0;
  public cacMembers;
  public projectCAC = false;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: 'col-2'
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-2'
    },
    {
      name: 'Live Near',
      value: 'liveNear',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'MemberOf',
      value: 'memberOf',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'KnowledgeOf',
      value: 'knowledgeOf',
      width: 'col-2',
      nosort: true
    },
    {
      name: 'Additional',
      value: 'additionalNotes',
      width: 'col-2',
      nosort: true
    }
  ];

  constructor(
    private dialogService: DialogService,
    private storageService: StorageService,
    private projectService: ProjectService,
    private tableTemplateUtils: TableTemplateUtils,
    private router: Router,
    private snackBar: MatSnackBar,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.loading = true;

    this.route.params.subscribe(params => {
      //  Set default params
      let newParams = Object.assign({}, params);
      if (!newParams.sortBy || newParams.sortBy === '') {
        newParams['sortBy'] = '-email';
      }
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(newParams, null, 25);
    });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data) {
          if (data.project && data.project[0].data.meta && data.project[0].data.meta.length > 0) {
            this.projectCAC = data.project[0].data.searchResults[0].projectCAC;
          }
          if (data.cacMembers && data.cacMembers[0].data.meta && data.cacMembers[0].data.meta.length > 0) {
            this.tableParams.totalListItems = data.cacMembers[0].data.meta[0].searchResultsTotal;
            this.cacMembers = data.cacMembers[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.cacMembers = [];
          }
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  setRowData() {
    let list = [];
    if (this.cacMembers && this.cacMembers.length > 0) {
      this.cacMembers.forEach(item => {
        list.push(
          item
        );
      });
      this.tableData = new TableObject(
        CACTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  isEnabled(button) {
    if (button === 'edit') {
      return this.selectedCount === 1;
    } else {
      return this.selectedCount > 0;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public onPageLimitClick(pageLimit: number | string) {
    if (pageLimit === 'all') {
      this.tableParams.pageSize = this.tableParams.totalListItems;
    } else {
      this.tableParams.pageSize = pageLimit as number;
    }
    this.onSubmit();
  }

  async copyEmail() {
    let itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    let list = [];
    itemsToExport.map(item => {
        list.push(item.email);
    });

    let filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    let userData = '';
    filteredArray.map(email => {
      userData += email + ';';
    });
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = userData;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.openSnackBar('Emails have been copied to your clipboard.', 'Close');
  }

  public selectAction(action) {
    switch (action) {
      case 'createCAC': {
        this.createCAC();
        break;
      }
      case 'deleteCAC': {
        this.deleteCAC();
        break;
      }
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'selectAll':
        let someSelected = false;

        // Safety check
        if (!this.tableData) {
          return;
        }

        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.tableData.data.map((item) => {
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
      case 'delete':
        this.deleteCACMember();
        break;
      case 'export':
        this.exportItems();
        break;
    }
  }

  private deleteCAC() {
    const self = this;
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Deleting this list will be a permanent action.',
        okOnly: false,
        message: 'Are you sure you want to delete the project Community Advisory Committee from this project?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            self.loading = true;
            self._changeDetectionRef.detectChanges();
            self.projectService.deleteCAC(self.currentProject._id).toPromise()
            .then(() => {
              // Update cac data, it was successful
              self.currentProject.projectCAC = false;
              self.onSubmit();
            })
            .catch((error) => {
              self.loading = false;
              self._changeDetectionRef.detectChanges();
              alert('Failed to remove CAC:' + error);
            });
          }
        }
      );
  }

  private createCAC() {
    const self = this;

    // Ask for the email account first
    this.dialogService.addDialog(EnterCACEmailComponent,
      {
        title: 'Add Community Advisory Committee',
        okOnly: false,
        message: 'Please enter the email for which this committee will be sending emails from.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (cacEmail: string) => {
          if (cacEmail !== '') {
            self.loading = true;
            self._changeDetectionRef.detectChanges();
            self.projectService.createCAC(self.currentProject._id, cacEmail).toPromise()
            .then((data) => {
              // Update cac data, it was successful
              self.currentProject.cacEmail = cacEmail;
              self.onSubmit();
            })
            .catch((error) => {
              self.loading = false;
              self._changeDetectionRef.detectChanges();
              alert('Failed to create CAC:' + error);
            });
          }
        }
      );
  }

  async deleteCACMember() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Members',
        okOnly: false,
        message: 'Click <strong>OK</strong> to delete selected Members or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            let itemsToDelete = [];
            this.tableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push({ promise: this.projectService.deleteCACMember(this.currentProject._id, item).toPromise(), item: item });
              }
            });
            this.loading = false;
            return Promise.all(itemsToDelete).then(() => {
              // Reload main page.
              this.onSubmit();
            });
          }
          this.loading = false;
        }
      );
  }

  async exportItems() {
    let itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    let list = [];
    itemsToExport.map(item => {
        list.push(item);
    });

    let filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    let userData = [];
    filteredArray.map(user => {
      userData.push({
        name: user.name,
        email: user.email,
        liveNear: user.liveNear,
        memberOf: user.memberOf,
        knowledgeOf: user.knowledgeOf,
        additionalNotes: user.additionalNotes
      });
    });

    // Export to CSV
    this.excelService.exportAsExcelFile(userData, 'cacMemberList');
  }

  public onSubmit() {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy || '-email';
    params['pageSize'] = this.tableParams.pageSize || 25;
    this.router.navigate(['p', this.currentProject._id, 'project-cac', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy || '-email';
    params['pageSize'] = this.tableParams.pageSize || 25;
    this.router.navigate(['p', this.currentProject._id, 'project-cac', params]);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
