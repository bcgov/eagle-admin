import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';


@Component({
  selector: 'tbody[app-pins-table-rows]',
  templateUrl: './pins-table-rows.component.html',
  styleUrls: ['./pins-table-rows.component.css'],
  standalone: true,
  imports: [],
})

export class PinsTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private recentActivityService = inject(RecentActivityService);
  private projectService = inject(ProjectService);

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
    if (activity.pinned === true) {
      activity.pinned = false;
    } else {
      activity.pinned = true;
    }
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
