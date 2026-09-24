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
- 2026-09-23: toLocalInputValue drops seconds, so a plain Save of a scheduled Update rewrites its publishDate to the minute.
- 2026-09-23: CSS nits: `.scheduled-flag` repeats the flag styles (share one base class); spacing of the new form rows.

## Sorting

- 2026-09-24 eagle-admin: Comment periods Published column sorts by `isPublished`, but the cell shows `read` (which can include `public`); make the sort key and the cell use the same field.
- 2026-09-24 eagle-admin: The mobile block in table-template.component.css copies the header rule in table.css (lines 139-145). Change that global selector to `.table thead th` and delete the component copy.
- 2026-09-24 eagle-admin: The select-all header icon in table-template.component.html only works by mouse: it is aria-hidden and cannot take focus. Make it a button with a label.
- 2026-09-24 eagle-admin: table-template sets aria-sort="none" on every unsorted header. ARIA 1.2 puts aria-sort on one header at a time, so return null for unsorted headers instead.
