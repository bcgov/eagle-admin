import { Component, OnInit, inject, ChangeDetectionStrategy} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { ISearchResults } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { DatePipe } from '@angular/common';
import { CommentPeriodBannerComponent } from '../comment-period-banner/comment-period-banner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-archived-detail',
    imports: [RouterModule, DatePipe, CommentPeriodBannerComponent],
    templateUrl: './project-archived-detail.component.html',
    styleUrl: './project-archived-detail.component.css',

})

export class ProjectArchivedDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);

  public project: Project = null;
  public currentProject;
  public isPublished;
  public substantiallyStarted;

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    const projId = this.route.parent.snapshot.paramMap.get('projId');

    const data = this.route.snapshot.data['fullProject'] as ISearchResults<FullProject>[];
    const row = data?.[0]?.data?.searchResults?.[0] as any;
    if (!row) {
      alert('Uh-oh, couldn\'t load project');
      this.router.navigate(['/search']);
      return;
    }
    this.project = row.legislationYearList.includes(2002) ? row.legislation_2002 : row.legislation_1996;
    this.project._id = projId;
    this.isPublished = row.isPublished === true;
    this.substantiallyStarted = (this.project.substantially === true) ? 'Yes' : 'No';
    this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
  }
}
