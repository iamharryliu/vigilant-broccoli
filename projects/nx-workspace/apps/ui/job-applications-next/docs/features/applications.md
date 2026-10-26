# Applications

## Overview

- A left sidebar switches `/` between the Applications, Career experience, Resume and Runs sections, kept in the `tab` query param. Applications lists the folders in the Job Applications folder as expandable cards, newest date first and, within a date, most recently created first. Titles, the Posting and Gaps tabs, the resume and cover letter viewers and the cover letter Copy button match vb-manager-next's [Sample page](../../../vb-manager-next/docs/features/sample.md)
- The card's ellipsis menu has Delete, which asks for confirmation and then removes the whole application folder; it is left out of the expanded card's action buttons, which run without a confirm step. Switching between the Posting and Gaps tabs eases the card to the new height
- There is no Open in Finder action: the server may run in a container with no access to the user's desktop
- `/?expand=latest` expands the newest card; the finished-run toast links to it
- A missing Job Applications folder lists as empty; the first run creates it

## New job application

- The Help item at the end of the sidebar opens a dialog explaining the bookmarklet, with a Paste manually button that opens the near full-screen form dialog. The bookmarklet opens `/` and opens that form prefilled from the posting's page. A page that frames the app can pass its own URL as `?bookmarklet=`; while framed by that URL's origin (`location.ancestorOrigins`, else the referrer) the bookmarklet opens it instead and posts to its origin, and the page relays the posting into the frame (vb-manager-next's [Job Hunt](../../../vb-manager-next/docs/features/job-hunt.md)). The accepted URL is kept in `sessionStorage` for the tab, since in-app links drop the param; unframed, the param is ignored
- `POST /api/job-applications/run` refuses to start while another run is in progress, and until the resume has a name and email (see [Career](./career.md))
- The run itself is described in [Runner](./runner.md)

## API

- `GET /api/job-applications?path=` lists a folder, `GET /api/job-applications/file?path=` serves a file; both are confined to the Job Applications folder
- `DELETE /api/job-applications?path=<folder>` deletes one application folder recursively; only a direct child of the Job Applications folder is accepted (400 otherwise, 404 if missing)
