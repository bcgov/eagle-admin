
import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { Router } from '@angular/router';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-project-list-table-rows]',
    templateUrl: './project-list-table-rows.component.html',
    styleUrl: './project-list-table-rows.component.css',
})

export class ProjectListTableRowsComponent implements OnInit, TableComponent {
    private router = inject(Router);

    data = input.required<TableObject>();
    columnData = input.required<TableColumn[]>();
    smallTable = input.required<boolean>();

    public projects: any;
    public paginationData: any;
    public columns: TableColumn[];
    public useSmallTable: boolean;

    ngOnInit() {
        this.projects = this.data().data;
        this.paginationData = this.data().paginationData;
        this.columns = this.columnData();
        this.useSmallTable = this.smallTable();
    }

    goToProject(project) {
        this.router.navigate([`p/${project._id}/project-details`]);
    }
}
