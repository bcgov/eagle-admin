import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tbody[app-pins-table-rows]',
    templateUrl: './pins-table-rows.component.html',
    styleUrls: ['./pins-table-rows.component.scss'],
    standalone: true,
    imports: [CommonModule],
})

export class PinsTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  private subscriptions = new Subscription();

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;
  public projectId: string;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private recentActivityService: RecentActivityService,
    private projectService: ProjectService
  ) { }

  async ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
    this.projectId = this.data.extraData.projectId;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  removeFromProject(pin) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      backdropClass: 'custom-backdrop',
      centered: true
    });

    modalRef.componentInstance.title = 'Delete Participating Indigenous Nation';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete this Participating Indigenous Nation or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    this.subscriptions.add(
      from(modalRef.result).subscribe({
        next: (isConfirmed: boolean) => {
          if (isConfirmed) {
            this.subscriptions.add(
              this.projectService.deletePin(this.projectId, pin._id)
                .subscribe({
                  next: () => {
                    this.contacts.splice(this.contacts.indexOf(pin), 1);
                    this._changeDetectionRef.detectChanges();
                  },
                  error: error => {
                    console.log('error =', error);
                  }
                })
            );
          }
        },
        error: () => {
          // Modal dismissed
        }
      })
    );
  }

  togglePin(activity) {
    activity.pinned === true ? activity.pinned = false : activity.pinned = true;
    this.subscriptions.add(
      this.recentActivityService.save(activity)
        .subscribe({
          next: () => {
            this._changeDetectionRef.detectChanges();
          },
          error: error => {
            console.log('error =', error);
          }
        })
    );
  }

  goToItem(activity) {
    // console.log('activity:', activity);
    this.router.navigate(['/project-pins', activity._id, 'edit']);
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.contacts.map(row => {
      if (row.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
