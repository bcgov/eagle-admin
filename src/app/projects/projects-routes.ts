import { Routes } from '@angular/router';
import { FormTab2002Component } from './add-edit-project/form-tab-2002/form-tab-2002.component';
import { FormTab2018Component } from './add-edit-project/form-tab-2018/form-tab-2018.component';

export const ProjectsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'form-2002',
    pathMatch: 'full',
  },
  {
    path: 'form-2002',
    component: FormTab2002Component
  },
  {
    path: 'form-2018',
    component: FormTab2018Component
  }
];
