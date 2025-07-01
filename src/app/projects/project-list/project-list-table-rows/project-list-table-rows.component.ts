import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
    selector: 'tbody[app-project-list-table-rows]',
    templateUrl: './project-list-table-rows.component.html',
    styleUrls: ['./project-list-table-rows.component.scss'],
    standalone: true,
    imports: [CommonModule],
})

export class ProjectListTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;

    public projects: any;
    public paginationData: any;
    public columns: any;
    public useSmallTable: boolean;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.projects = this.data.data;
        this.paginationData = this.data.paginationData;
        this.columns = this.columnData;
        this.useSmallTable = this.smallTable;
    }

    goToProject(project) {
        this.router.navigate([`p/${project._id}/project-details`]);
    }
}
