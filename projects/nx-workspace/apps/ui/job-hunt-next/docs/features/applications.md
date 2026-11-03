# Applications

## Overview

- A left sidebar switches `/` between the Applications, Career experience, Resume, Runs and Settings sections, kept in the `tab` query param. Applications lists the folders in the Job Applications folder as expandable cards, newest date first and, within a date, most recently created first.
- Open posting is a button in the expanded card's Posting tab (hidden in demo mode). It opens the original page from the `Posting URL:` line the run saves, in a new tab with no opener; a posting saved without a URL has no button
- The expanded card has no action sidebar; its tabs are Posting, Gaps, Resume and Cover letter. The card's ellipsis menu has Mark as applied and Delete, which asks for confirmation and then removes the whole application folder. Switching tabs eases the card to the new height
- Mark as applied (ellipsis menu, toggling to Mark as not applied) records the status in a hidden `.applied` file in the application folder. Applied cards show an Applied badge. Demo mode shows two applied cards and hides the action
- There is no Open in Finder action: the server may run in a container with no access to the user's desktop
- `/?expand=latest` expands the newest card; the finished-run toast links to it. The list reads the param only on mount; when a run finishes it re-fetches without changing which cards are expanded
- A missing Job Applications folder lists as empty; the first run creates it

## Application resume

- An expanded card's Resume tab shows the application's tailored resume, with a toolbar in the tab row to switch between the rendered resume, Edit JSON and History. History diffs any two saved versions (From and To). Version v0 is the master resume the run started from, so the default diff shows exactly what tailoring changed
- The skill saves the tailored resume as a `.json` twin of the resume PDF. Applications generated before that have none, and their tab says so
- Saving an edit overwrites the twin, rewrites the PDF from it and records a version in `STATE_DIR/application-resume-versions/<hash of the folder name>/`; a failed PDF render still keeps the JSON and the version
- `GET`/`PUT /api/job-applications/resume?path=<folder>` read and save it; `PUT` validates the resume first. The master Resume section keeps its own versions through `GET /api/career/versions`, which also snapshots out-of-band edits

## Application cover letter

- An expanded card's Cover letter tab shows the plain-text letter, with a toolbar in the tab row to copy it and switch between the text, its PDF, Edit and History. History diffs any two saved versions (From and To); unlike the resume there is no v0 base, so versions start at v1
- Saving an edit overwrites the `.txt`, regenerates the PDF with the application's tailored resume title and records a version in `STATE_DIR/application-cover-letter-versions/<hash of the folder name>/`. A failed render (such as a letter over one page) still keeps the text and the version
- `GET`/`PUT /api/job-applications/cover-letter?path=<folder>` read and save it. Applications without a letter file say so in the tab

## New job application

- The Help item at the end of the sidebar opens a dialog explaining the bookmarklet, with a Paste manually button that opens the near full-screen form dialog. The bookmarklet opens `/` and opens that form prefilled from the posting's page. A page that frames the app can pass its own URL as `?bookmarklet=`; while framed by that URL's origin (`location.ancestorOrigins`, else the referrer) the bookmarklet opens it instead and posts to its origin, and the page relays the posting into the frame (local-manager-next's [Job Hunt](../../../local-manager-next/docs/features/job-hunt.md)). The accepted URL is kept in `sessionStorage` for the tab, since in-app links drop the param; unframed, the param is ignored
- `POST /api/job-applications/run` refuses to start while another run is in progress, and until the resume has a name and email (see [Career](./career.md))
- The run itself is described in [Runner](./runner.md)

## API

- `GET /api/job-applications?path=` lists a folder, `GET /api/job-applications/file?path=` serves a file; both are confined to the Job Applications folder
- `GET /api/job-applications/applied` lists the applied folder names; `PUT /api/job-applications/applied?path=<folder>[&applied=false]` marks or clears one (same direct-child rule as delete)
- `DELETE /api/job-applications?path=<folder>` deletes one application folder recursively; only a direct child of the Job Applications folder is accepted (400 otherwise, 404 if missing)
