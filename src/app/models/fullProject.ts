import { Project } from './project';

export class FullProject {
  _id: string;
  currentLegislationYear: string;
  legislationYearList: number[];
  legislation_1996: Project;
  legislation_2002: Project;
  legislation_2018: Project;
}
