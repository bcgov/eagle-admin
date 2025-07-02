import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsTableRowsComponent } from './project-groups-table-rows/project-groups-table-rows.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { InputModalComponent } from 'src/app/input-modal/input-modal.component';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { ExcelService } from 'src/app/services/excel.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrls: ['./project-groups.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TableTemplateComponent]
})
export class ProjectGroupsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  public currentProject;
  readonly tabLinks = [
    { label: 'Contacts', link: 'project-groups' },
    { label: 'Participating Indigenous Nations', link: 'project-pins' }
  ];
  public loading = true;
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;
  private inputModal: NgbModalRef = null;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: '10%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: '90%'
    }
  ];
  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private excelService: ExcelService,
    private modalService: NgbModal,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.subscriptions.add(
      this.route.params
        .subscribe(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-dateAdded';
            this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          }
          this._changeDetectionRef.detectChanges();
        })
    );

    this.subscriptions.add(
      this.route.data
        .subscribe((res: any) => {
          if (res) {
            if (res.contacts[0].data.meta && res.contacts[0].data.meta.length > 0) {
              this.tableParams.totalListItems = res.contacts[0].data.meta[0].searchResultsTotal;
              this.entries = res.contacts[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.entries = [];
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }

  setRowData() {
    const list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach((item: any) => {
        list.push(item);
      });
      this.tableData = new TableObject(
        GroupsTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    switch (action) {
      case 'copyEmail':
        this.copyEmail();
        break;
      case 'selectAll':
        let someSelected = false;
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
      case 'edit':
        this.navigationStackUtils.clearNavigationStack();
        const selected = this.tableData.data.filter(item => item.checkbox === true);
        this.router.navigate(['/p', this.currentProject._id, 'project-groups', 'g', selected[0]._id, 'members']);
        break;
      case 'add':
        this.addNewGroup();
        break;
      case 'delete':
        this.deleteItems();
        break;
      case 'export':
        this.exportItems();
        break;
    }
  }

  async copyEmail() {
    const itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    const list = [];
    itemsToExport.map(group => {
      group.members.map(member => {
        list.push(member);
      });
    });

    const filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    // Get all the user emails
    const csvData = [];
    filteredArray.map((item) => {
      csvData.push(
        this.searchService.getItem(item, 'User').toPromise()
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
        const selBox = document.createElement('textarea');
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
    const itemsToExport = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToExport.push(item);
      }
    });
    const list = [];
    itemsToExport.map(group => {
      group.members.map(member => {
        list.push(member);
      });
    });

    const filteredArray = list.reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    // Get all the user emails
    const csvData = [];
    filteredArray.map((item) => {
      csvData.push(
        this.searchService.getItem(item, 'User').toPromise()
      );
    });
    this.loading = false;
    return Promise.all(csvData)
      .then((data) => {
        const userData = [];
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

  async addNewGroup() {
    this.inputModal = this.modalService.open(InputModalComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    this.inputModal.result.then(async result => {
      if (result) {
        // Add the group name
        await this.projectService.addGroup(this.currentProject, result).toPromise();
        this.onSubmit();
      }
    });
    return;
  }

  public async deleteItems() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static', // Prevent closing when clicking outside
      centered: true, // Center the modal
    });

    modalRef.componentInstance.title = 'Delete Groups';
    modalRef.componentInstance.message =
      'Click <strong>OK</strong> to delete selected Group or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    try {
      const isConfirmed = await modalRef.result;

      if (isConfirmed) {
        this.loading = true;
        const itemsToDelete = [];
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            itemsToDelete.push({
              promise: this.projectService.deleteGroup(this.currentProject, item._id).toPromise(),
              item: item
            });
          }
        });

        this.loading = false;

        await Promise.all(itemsToDelete);
        // Reload main page.
        this.onSubmit();
      }

      this.loading = false;
    } catch (error) {
      // Handle modal dismiss or any other errors if necessary
      this.loading = false;
    }
  }

  isEnabled(button) {
    if (button === 'edit') {
      return this.selectedCount === 1;
    } else {
      return this.selectedCount > 0;
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  // Called via storage service in shared module.
  add(contacts, component) {
    const filteredPins = [];
    contacts.filter((thing) => {
      const idx = component.entries.findIndex((t) => {
        return (t._id === thing._id);
      });
      if (idx === -1) {
        filteredPins.push(thing._id);
      }
    });
    alert('not implemented');
    // Add all the filtered new items.
    // component.projectService.addPins(component.currentProject, filteredPins)
    // // .takeUntil(component.ngUnsubscribe)
    // .subscribe(
    //   () => { // onCompleted
    //     // this.loading = false;
    //     // this.router.navigated = false;
    //     // this.openSnackBar('This project was created successfuly.', 'Close');
    //     component.router.navigate(['/p', component.currentProject._id, 'project-pins']);
    //   },
    //   error => {
    //     console.log('error =', error);
    //     alert('Uh-oh, couldn\'t edit project');
    //   },
    // );
  }

  public onSubmit(pageNumber = 1, reset = false) {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;
    this._changeDetectionRef.detectChanges();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;

    if (reset) {
      this.tableParams.sortBy = '';
      this.tableParams.pageSize = 25;
      this.tableParams.keywords = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    this.router.navigate(['p', this.currentProject._id, 'project-groups', params]);
  }

  public toggleFilter(filterItem) {
    if (this.typeFilters.includes(filterItem)) {
      this.typeFilters = this.typeFilters.filter(item => item !== filterItem);
    } else {
      this.typeFilters.push(filterItem);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
