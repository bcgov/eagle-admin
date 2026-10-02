# TODO

## Updates form

- 2026-09-23: Document pickers list non-public project documents; limit featured image and attachments to public ones.
- 2026-09-23: Missing spec cases: Save draft confirm on a live Update, double-click guard, API error toast text, Corporate subject sent.
- 2026-09-23: Confirm dialog wording for Save draft and Archive needs a plain-language pass.
- 2026-09-23: A user type change re-runs updateProject and reloads documents and location; skip the reload when the project did not change.
- 2026-09-23: Archived Updates need a status filter in the activity list (`and=status=archived`).
- 2026-09-23: CSS nit: spacing of the new Update form rows.
- 2026-10-02 eagle-admin: status flags fail AA contrast (white on `#5BB75C` about 2.5:1, white on `red` about 4.0:1); pick darker tokens. The `.active-flag`/`.inactive-flag` styles are still copied in pins-list, activity-detail-table-rows and activity.component.css.
- 2026-09-24 eagle-admin: the Update image picker loads full-size originals as thumbnails (update-image-picker.component.html); there is no thumbnail service yet.
- 2026-09-24 eagle-admin: the nonPublicImages attachment check only sees loaded documents: none while loading, none after a failed search, only the first 1000. Say so when the check cannot run.
- 2026-09-24 eagle-admin: the image picker switches to radio mode whenever max is 1, even for Photos with one slot left. The opener should pass a multiple flag.
- 2026-09-24 eagle-admin: the file-upload browse link changed from <a> to <button class="browse">. Check project-documents-upload, project-notification-upload and add-comment.

## Sorting

- 2026-09-24 eagle-admin: Comment periods Published column sorts by `isPublished`, but the cell shows `read` (which can include `public`); make the sort key and the cell use the same field.
- 2026-09-24 eagle-admin: The mobile block in table-template.component.css copies the header rule in table.css (lines 139-145). Change that global selector to `.table thead th` and delete the component copy.
- 2026-09-24 eagle-admin: The select-all header icon in table-template.component.html only works by mouse: it is aria-hidden and cannot take focus. Make it a button with a label.
- 2026-09-24 eagle-admin: table-template sets aria-sort="none" on every unsorted header. ARIA 1.2 puts aria-sort on one header at a time, so return null for unsorted headers instead.
