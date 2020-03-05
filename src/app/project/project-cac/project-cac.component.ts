import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router, ActivatedRoute } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Subject } from 'rxjs';
import { SearchTerms, ISearchResults } from 'app/models/search';
import { CACTableRowsComponent } from 'app/project/project-cac/cac-table-rows/cac-table-rows.component';
import { Utils } from 'app/shared/utils/utils';
import { Project } from 'app/models/project';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { SearchService } from 'app/services/search.service';
import { ExcelService } from 'app/services/excel.service';
import { MatSnackBar } from '@angular/material';

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
      name: 'Comment',
      value: 'comment',
      width: 'col-7',
      nosort: true
    }
  ];

  constructor(
    private dialogService: DialogService,
    private storageService: StorageService,
    private searchService: SearchService,
    private router: Router,
    private snackBar: MatSnackBar,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    // this.route.params
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(params => {
    //     this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    //     this.tableParams.sortBy = '-email';
    //   });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data) {
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
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'selectAll':
        let someSelected = false;

        // Safety check
        if (!this.tableData) {
          return;
        };

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
      case 'add':
        this.addNewMember();
        break;
      case 'delete':
        this.deleteItems();
        break;
      case 'export':
        this.exportItems();
        break;
    }
  }

  private addNewMember() {
    alert('TBD');
  }

  async deleteItems() {
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
                // itemsToDelete.push({ promise: this.projectService.deleteGroup(this.currentProject, item._id).toPromise(), item: item });
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
        email: user.email
      });
    });

    // Export to CSV
    this.excelService.exportAsExcelFile(userData, 'cacMemberList');
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-email';
    // params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-cac', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy || '-email';
    // params['keywords'] = this.utils.encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
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
