export interface IAddEditTab {
  // Label on the tab
  label: string;
  // link to the specific component
  link: string;
  // the years that MUST match the keys in the api response
  years: string[];
}
