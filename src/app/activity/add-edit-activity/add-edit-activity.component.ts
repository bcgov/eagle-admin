import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProjectService } from 'app/services/project.service';
import { RecentActivityService } from 'app/services/recent-activity';
import { RecentActivity } from 'app/models/recentActivity';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrls: ['./add-edit-activity.component.scss']
})
export class AddEditActivityComponent implements OnInit {
  public myForm: FormGroup;
  public isEditing = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public projects = [];
  public types = [];
  public activity: any;

  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    height: 240
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utils: Utils,
    private recentActivityService: RecentActivityService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        if (Object.keys(res).length === 0 && res.constructor === Object) {
          this.buildForm({
            'headline': '',
            'content': '',
            'dateAdded': new Date(),
            'project': '',
            'active': '',
            'pinned': false,
            'type': '',
            'contentUrl': '',
            'documentUrl': ''
          });
        } else {
          this.isEditing = true;
          this.buildForm(res.activity.data);
          this.activity = res.activity.data;
        }
        this.loading = false;
      });

    this.projectService.getAll(1, 1000, '+name')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.projects = res.data;
          // TODO: Later
          // Types
          // this.types = this.configService.lists.filter(item => {
          //   return item.type === 'headlineType';
          // });
        }
      });
  }

  onCancel() {
    this.router.navigate(['/activity']);
  }

  onSubmit() {
    if (this.isEditing) {
      let activity = new RecentActivity({
        _id: this.activity._id,
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateAdded').value),
        project: this.myForm.get('project').value,
        type: this.myForm.get('type').value,

        // TODO: ETL this to merge.
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        active: this.myForm.controls.active.value === 'yes' ? true : false,
        pinned: this.activity.pinned
      });
      console.log('saving:', activity);
      this.recentActivityService.save(activity)
        .subscribe(item => {
          // console.log('item', item);
          this.router.navigate(['/activity']);
        });
    } else {
      let activity = new RecentActivity({
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: new Date(),
        project: this.myForm.get('project').value,
        type: this.myForm.get('type').value,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        pinned: false,
        active: this.myForm.controls.active.value === 'yes' ? true : false
      });
      console.log('adding:', activity);
      this.recentActivityService.add(activity)
        .subscribe(item => {
          // console.log('saved:', item);
          this.router.navigate(['/activity']);
        });
    }
  }

  register(myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  buildForm(data) {
    // console.log('data:', data);
    this.myForm = new FormGroup({
      'headline': new FormControl(data.headline),
      'content': new FormControl(data.content),
      'dateAdded': new FormControl(this.utils.convertJSDateToNGBDate(new Date(data.dateAdded))),
      'project': new FormControl(data.project),
      'active': new FormControl(data.active ? 'yes' : 'no'),
      'type': new FormControl(data.type),
      'contentUrl': new FormControl(data.contentUrl),
      'documentUrl': new FormControl(data.documentUrl)
    });
  }

}
