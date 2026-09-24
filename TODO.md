# TODO

## Updates form

- 2026-09-23: Archive in the activity list has no spec, and a failed archive only logs; show an error toast.
- 2026-09-23: Category label shows an asterisk on edit, but category is only required on new Updates.
- 2026-09-23: Summary field needs a hint that it is plain text (no HTML).
- 2026-09-23: Document pickers list non-public project documents; limit featured image and attachments to public ones.
- 2026-09-23: Publish date `[min]` blocks editing a past date on an existing Update; drop `[min]` when editing.
- 2026-09-23: Publish ignores a date typed in the publish date field; say so on the form or use it.
- 2026-09-23: Changing a live Update's publish date to the future and pressing Save should ask for confirmation, since it hides the Update until then.
- 2026-09-23: Missing spec cases: Save draft confirm on a live Update, double-click guard, API error toast text, Corporate subject sent.
- 2026-09-23: Confirm dialog wording for Save draft and Archive needs a plain-language pass.
- 2026-09-23: A user type change re-runs updateProject and reloads documents and location; skip the reload when the project did not change.
- 2026-09-23: Archived Updates need a status filter in the activity list (`and=status=archived`).
- 2026-09-23: scheduledDate() in add-edit-activity builds publishDate from the date picker and ngb-timepicker (hour and minute only), so saving a scheduled Update rewrites its publishDate to the minute.
- 2026-09-23: CSS nits: `.scheduled-flag` repeats the flag styles (share one base class); spacing of the new form rows.
- 2026-09-24 eagle-admin: the Update image picker loads full-size originals as thumbnails (update-image-picker.component.html); there is no thumbnail service yet.
- 2026-09-24 eagle-admin: the IMAGE_FILE regex in add-edit-activity.component.ts copies IMAGE_TYPES in update-image-field.component.ts. Export one list. The "10 MB" help text repeats IMAGE_MAX_MB.
- 2026-09-24 eagle-admin: the nonPublicImages attachment check only sees loaded documents: none while loading, none after a failed search, only the first 1000. Say so when the check cannot run.
- 2026-09-24 eagle-admin: caption and credit length are checked twice (Validators.maxLength and imageTextErrors). Keep one.
- 2026-09-24 eagle-admin: the "Not public" and "Goes public" status ids in update-image-field.component.html are not in the alt input's aria-describedby.
- 2026-09-24 eagle-admin: dismiss() in update-image-field focuses the Add button, which is not rendered when remaining() is 0. Fall back to the last Remove button.
- 2026-09-24 eagle-admin: the image picker switches to radio mode whenever max is 1, even for Photos with one slot left. The opener should pass a multiple flag.
- 2026-09-24 eagle-admin: the file-upload browse link changed from <a> to <button class="browse">. Check project-documents-upload, project-notification-upload and add-comment.
