import { Router } from '@angular/router';
import { FullProject } from 'src/app/models/fullProject';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectCreatedPartlyError } from 'src/app/services/project.service';
import { ToastService } from 'src/app/services/toast.service';

const OTHER_ACT_TAB_MESSAGE = 'Only the current Act\'s fields can be changed here';
const NOT_LOADED_MESSAGE = 'This project could not be loaded for edit, so nothing was saved.';
export const CREATE_UNKNOWN_MESSAGE = 'The create did not finish, so the project may have been created. Check the project list before you try again.';
const REENTER_FIELDS_MESSAGE = 'Enter the remaining fields again on the edit page.';

// Order matters: tabs show in this order, and the add page shows only the last (newest) Act.
export const EDIT_TABS: readonly IAddEditTab[] = [
  { label: '1996/2002 Environmental Assessment Acts', link: 'form-2002', years: ['legislation_1996', 'legislation_2002'] },
  { label: '2018 Environmental Assessment Act', link: 'form-2018', years: ['legislation_2018'] },
];

// DEMI's PUT writes only the current Act's fields. With no loaded project, an edit route's Save would POST a new one.
/** Toasts and returns true when a tab must not write. */
export function refuseTabWrite(toast: ToastService, projectId: string | null, fullProject: FullProject | null, tabYear: number): boolean {
  let refusal: string | null = null;
  if (projectId && !fullProject) {
    refusal = NOT_LOADED_MESSAGE;
  } else if (projectId && fullProject.currentLegislationYear !== `legislation_${tabYear}`) {
    refusal = OTHER_ACT_TAB_MESSAGE;
  }
  if (refusal) {
    toast.error(refusal);
  }
  return refusal !== null;
}

/** A tab's handler for a failed project write: logs, then toasts the error text. */
export function projectWriteFailed(logger: LoggingService, toast: ToastService, source: string) {
  return (action: 'save' | 'publish' | 'unpublish') => (error: Error) => {
    logger.error(`Failed to ${action} project`, source, error);
    toast.error(`Failed to ${action} project. ${error.message}`);
  };
}

/**
 * A tab's handler for a failed create. `refused`: nothing was made. `created`: it left for the new project's edit page.
 * `unknown`: no answer or a 5xx came back, so the create may have gone through.
 */
export function projectCreateFailed(logger: LoggingService, toast: ToastService, router: Router, source: string) {
  const writeFailed = projectWriteFailed(logger, toast, source);
  return (action: 'save' | 'publish') => (error: Error & { status?: number }): 'refused' | 'created' | 'unknown' => {
    if (error instanceof ProjectCreatedPartlyError) {
      logger.error('Project created partly', source, error);
      toast.error(error.saved ? error.message : `${error.message.replace(/\.$/, '')}. ${REENTER_FIELDS_MESSAGE}`);
      router.navigate(['/p', error.id, 'edit']);
      return 'created';
    }
    // Status 0 is no answer at all; DEMI can write the row and still answer 5xx.
    if (error.status === 0 || error.status >= 500) {
      logger.error('Project create may have gone through', source, error);
      toast.error(CREATE_UNKNOWN_MESSAGE);
      return 'unknown';
    }
    writeFailed(action)(error);
    return 'refused';
  };
}
