import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { SearchService } from 'app/services/search.service';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { SearchTerms } from 'app/models/search';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { GroupTableRowsComponent } from './group-table-rows/group-table-rows.component';
import { StorageService } from 'app/services/storage.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { ProjectService } from 'app/services/project.service';
import { MatSnackBar } from '@angular/material';
import { ExcelService } from 'app/services/excel.service';

@Component({
  selector: 'app-group-contact',
  templateUrl: './group-contact.component.html',
  styleUrls: ['./group-contact.component.scss']
})
export class GroupContactComponent implements OnInit, OnDestroy {
  public currentProject;
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public users: User[] = null;
  public group: any = null;
  public loading = true;
  private groupId: any = null;
  public tempGroupName = '';

  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-3'
    },
    {
      name: 'Organization',
      value: 'orgName',
      width: 'col-3'
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-3'
    },
    {
      name: 'Phone Number',
      value: 'phoneNumber',
      width: 'col-2'
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private route: ActivatedRoute,
    private excelService: ExcelService,
    private router: Router,
    private storageService: StorageService,
    private dialogService: DialogService,
    private searchService: SearchService,
    private projectService: ProjectService,
    private _changeDetectionRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('groupId');
    });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        // Incoming users
        if (res && res.users && res.users.length > 0) {
          this.tableParams.totalListItems = res.users.length;
          this.users = res.users;
        } else {
          this.tableParams.totalListItems = 0;
          this.users = [];
        }
        // Incoming group

        if (res && res.group && res.group[0].data && res.group[0].data.meta && res.group[0].data.meta.length > 0) {
          this.group = res.group[0].data.searchResults[0];
          this.tempGroupName = this.group.name;
        } else {
          // Something wrong
          this.router.navigate(['/p', this.currentProject._id, 'project-groups']);
        }
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      }
      );
  }

  isEnabled(button) {
    if (button === 'selectAll') {
      return this.users.length > 0;
    } else {
      return this.selectedCount > 0;
    }
  }

  public checkChange(event) {
  }

  setRowData() {
    if (this.users && this.users.length > 0) {
      const list = [...this.users];
      this.tableData = new TableObject(
        GroupTableRowsComponent,
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
    this.getPaginatedContacts(this.tableParams.currentPage);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'add':
        // Add activity
        this.setBackURL();
        break;
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'export':
        this.exportItems();
        break;
      case 'delete':
        // Add activity
        this.deleteItems();
        break;
      case 'selectAll':
        let someSelected = false;
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
    }
  }

  async copyEmail() {
    let itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    let list = [];
    itemsToExport.map(member => {
      list.push(member);
    });

    let filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    // Get all the user emails
    let csvData = [];
    filteredArray.map((item) => {
      csvData.push(
        this.searchService.getItem(item._id, 'User').toPromise()
      );
    });
    this.loading = false;
    return Promise.all(csvData)
      .then((data) => {
        // Reload main page.
        let userData = '';
        data.map(p => {
          userData += p.data.email + ';';
        });
        console.log(userData);
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
      });
  }

  async exportItems() {
    let itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    let list = [];
    itemsToExport.map(member => {
      list.push(member);
    });

    let filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    // Get all the user emails
    let csvData = [];
    filteredArray.map((item) => {
      csvData.push(
        this.searchService.getItem(item._id, 'User').toPromise()
      );
    });
    this.loading = false;
    return Promise.all(csvData)
      .then((data) => {
        // Reload main page.
        let userData = [];
        data.map(p => {
          userData.push({
            name: p.data.firstName + ' ' + p.data.lastName,
            title: p.data.title,
            organization: p.data.orgName,
            phone: p.data.phoneNumber,
            address: p.data.address1 + (p.data.address2 === '' ? '' : p.data.address2),
            city: p.data.city,
            province: p.data.province,
            postal: p.data.postalCode,
            email: p.data.email
          });
        });
        console.log(userData);

        // Export to CSV
        this.excelService.exportAsExcelFile(userData, 'contactList');
      });
  }

  setBackURL() {
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-groups', 'g', this.groupId, 'members'], label: this.group.name };
    this.storageService.state.add = this.add;
    this.storageService.state.component = this;
    this.storageService.state.componentModel = 'User';
    this.storageService.state.existing = this.users;
    this.storageService.state.tableColumns = this.tableColumns;
    this.storageService.state.rowComponent = GroupTableRowsComponent;
    this.storageService.state.sortBy = this.tableParams.sortBy;
    this.router.navigate(['/p', this.currentProject._id, 'project-groups', 'g', this.groupId, 'members', 'select']);
  }

  add(contacts, component) {
    let filteredMembers = [];
    contacts.filter((thing) => {
      let idx = component.users.findIndex((t) => {
        return (t._id === thing._id);
      });
      if (idx === -1) {
        filteredMembers.push(thing._id);
      }
    });
    // Add all the filtered new items.
    component.projectService.addGroupMembers(component.currentProject, component.groupId, filteredMembers)
      // .takeUntil(component.ngUnsubscribe)
      .subscribe(
        () => { // onCompleted
          // this.loading = false;
          // this.router.navigated = false;
          // this.openSnackBar('This project was created successfuly.', 'Close');
          component.router.navigate(['/p', component.currentProject._id, 'project-groups', 'g', component.groupId, 'members']);
        },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t edit project');
        },
      );
  }

  deleteItems() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Remove Contact',
        message: 'Click <strong>OK</strong> to remove or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            // Delete the Document(s)
            let itemsToDelete = [];
            this.tableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push({ promise: this.projectService.deleteGroupMembers(this.currentProject._id, this.groupId, item._id).toPromise(), item: item });
              }
            });
            this.loading = false;
            return Promise.all(itemsToDelete).then(() => {
              // Reload page.
              const params = this.terms.getParams();
              params['ms'] = new Date().getMilliseconds();
              this.router.navigate(['/p', this.currentProject._id, 'project-groups', 'g', this.groupId, 'members', params]);
            });
          }
          this.loading = false;
        }
      );
  }

  getPaginatedContacts(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(null,
      'User',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      {})
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.users = res[0].data.searchResults;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, null || '');
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  async saveName() {
    let groupObj = { name: this.tempGroupName };
    await this.projectService.saveGroup(this.currentProject._id, this.group._id, groupObj).toPromise();
    this.group.name = this.tempGroupName;
    this.openSnackBar('Group name has been updated', 'Close');
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
