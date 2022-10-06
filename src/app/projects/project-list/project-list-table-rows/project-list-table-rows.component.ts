import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api';
import { FavouriteService } from 'app/services/favourite.service';

@Component({
    selector: 'tbody[app-project-list-table-rows]',
    templateUrl: './project-list-table-rows.component.html',
    styleUrls: ['./project-list-table-rows.component.scss']
})

export class ProjectListTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;

    @Output() updateFavourites: EventEmitter<any> = new EventEmitter<any>();


    public projects: any;
    public paginationData: any;
    public columns: any;
    public useSmallTable: boolean;

    constructor(
        private router: Router,
        public apiService: ApiService,
        public favouriteService: FavouriteService,
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
    goToDocuments(project) {
        this.router.navigate([`p/${project._id}/project-documents`]);
    }

    public addToFavourite(item, type: string = 'Project') {
      this.apiService.addFavourite(item, type)
        .then(() => {
          this.updateFavourites.emit({data: {type}, label: 'Update Favourite'});
        }).catch((err) => {
          console.log('error adding favourite', err)
        });
    }

    public removeFavourite(item) {
      this.apiService.removeFavourite(item)
        .then(() => {
          this.updateFavourites.emit({data: {type: 'Project'}, label: 'Update Favourite'});
        }).catch((err) => {
          console.log('error removing favourite', err)
        });
    }
}
