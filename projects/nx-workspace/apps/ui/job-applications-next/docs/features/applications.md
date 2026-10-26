# Applications

## Overview

- `/` lists the folders in the Job Applications folder as expandable cards, newest date first and, within a date, most recently created first. Titles, the Posting and Gaps tabs, the resume and cover letter viewers and the cover letter Copy button match vb-manager-next's [Sample page](../../../vb-manager-next/docs/features/sample.md)
- There is no Open in Finder action: the server may run in a container with no access to the user's desktop
- `/?expand=latest` expands the newest card; the finished-run toast links to it
- A missing Job Applications folder lists as empty; the first run creates it

## New job application

- The header button opens the dialog; its bookmarklet opens `/` and prefills it from the posting's page
- `POST /api/job-applications/run` refuses to start while another run is in progress, and until the resume has a name and email (see [Career](./career.md))
- The run itself is described in [Runner](./runner.md)

## API

- `GET /api/job-applications?path=` lists a folder, `GET /api/job-applications/file?path=` serves a file; both are confined to the Job Applications folder
