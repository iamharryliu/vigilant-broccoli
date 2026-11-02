# Applications

## Overview

- A left sidebar switches `/` between the Applications, Career experience, Resume, Runs and Settings sections, kept in the `tab` query param. Applications lists the folders in the Job Applications folder as expandable cards, newest date first and, within a date, most recently created first.
- Open posting (first card action, also in the ellipsis menu) opens the posting's original page from the `Posting URL:` line the run saves, in a new tab with no opener; a posting saved without a URL reports that instead. The tab opens inside the click and is pointed at the URL once the posting file is read, so popup blockers allow it
- The card's ellipsis menu has Delete, which asks for confirmation and then removes the whole application folder; it is left out of the expanded card's action buttons, which run without a confirm step. Switching between the Posting and Gaps tabs eases the card to the new height
- Mark as applied (ellipsis menu and expanded card actions, toggling to Mark as not applied) records the status in a hidden `.applied` file in the application folder. Applied cards show an Applied badge. Demo mode shows two applied cards and hides the action
- There is no Open in Finder action: the server may run in a container with no access to the user's desktop
- `/?expand=latest` expands the newest card; the finished-run toast links to it
- A missing Job Applications folder lists as empty; the first run creates it

## Application resume

- An expanded card's Resume tab shows the application's tailored resume, with a toolbar in the tab row to switch between the rendered resume, Edit JSON and History. History diffs any two saved versions (From and To)
- The skill saves the tailored resume as a `.json` twin of the resume PDF. Applications generated before that have none, and their tab says so
- Saving an edit overwrites the twin, rewrites the PDF from it and records a version in `STATE_DIR/application-resume-versions/<hash of the folder name>/`; a failed PDF render still keeps the JSON and the version
- `GET`/`PUT /api/job-applications/resume?path=<folder>` read and save it; `PUT` validates the resume first. The master Resume section keeps its own versions through `GET /api/career/versions`, which also snapshots out-of-band edits

## New job application

- The Help item at the end of the sidebar opens a dialog explaining the bookmarklet, with a Paste manually button that opens the near full-screen form dialog. The bookmarklet opens `/` and opens that form prefilled from the posting's page. A page that frames the app can pass its own URL as `?bookmarklet=`; while framed by that URL's origin (`location.ancestorOrigins`, else the referrer) the bookmarklet opens it instead and posts to its origin, and the page relays the posting into the frame (local-manager-next's [Job Hunt](../../../local-manager-next/docs/features/job-hunt.md)). The accepted URL is kept in `sessionStorage` for the tab, since in-app links drop the param; unframed, the param is ignored
- `POST /api/job-applications/run` refuses to start while another run is in progress, and until the resume has a name and email (see [Career](./career.md))
- The run itself is described in [Runner](./runner.md)

## API

- `GET /api/job-applications?path=` lists a folder, `GET /api/job-applications/file?path=` serves a file; both are confined to the Job Applications folder
- `GET /api/job-applications/applied` lists the applied folder names; `PUT /api/job-applications/applied?path=<folder>[&applied=false]` marks or clears one (same direct-child rule as delete)
- `DELETE /api/job-applications?path=<folder>` deletes one application folder recursively; only a direct child of the Job Applications folder is accepted (400 otherwise, 404 if missing)
