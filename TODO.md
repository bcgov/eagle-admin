# TODO

## Updates form

- 2026-09-23: Confirm dialog wording for Save draft and Archive needs a plain-language pass.
- 2026-09-23: Archived Updates need a status filter in the activity list (`and=status=archived`).
- 2026-09-23: CSS nit: spacing of the new Update form rows.
- 2026-10-02 eagle-admin: status flags fail AA contrast (white on `#5BB75C` about 2.5:1, white on `red` about 4.0:1); pick darker tokens. The `.active-flag`/`.inactive-flag` styles are still copied in pins-list, activity-detail-table-rows and activity.component.css.
- 2026-09-24 eagle-admin: the Update image picker loads full-size originals as thumbnails (update-image-picker.component.html); there is no thumbnail service yet.
- 2026-09-24 eagle-admin: the file-upload browse link changed from <a> to <button class="browse">. Check project-documents-upload, project-notification-upload and add-comment.
