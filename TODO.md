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

- 2026-10-02 eagle-admin: table-template select-all icon and `selectAllClicked` payload still follow the `selectAll` flag, which goes stale once rows are ticked by hand; drive both from the rows, as `selectAllLabel` does. Its spec's stand-in consumer should copy the documents pages (`checkbox = !someSelected`).
