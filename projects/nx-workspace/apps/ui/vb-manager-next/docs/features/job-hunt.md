# Job Hunt

## Overview

- `/job-hunt` page (sidebar entry `SIDEBAR_ROUTE.JOB_HUNT` with a `ClipboardList` icon, below Career 2) fills the content area edge to edge (no card or border) with an iframe of [job-applications-next](../../../job-applications-next/README.md) at `LOCAL_HOST_URL.JOB_HUNT` (`https://job-hunt.vigilant-broccoli.app`), the app's Docker container behind the local k3s ingress
- The iframe has `allow="clipboard-write"` so the embedded app's Copy buttons work
- The embedded app must allow the manager in its `JOB_APPLICATIONS_FRAME_ANCESTORS`; `pnpm job-applications:docker:up` sets it
- Bookmarklet relay: the iframe `src` passes `?bookmarklet=https://manager.vigilant-broccoli.app/job-hunt`, so the bookmarklet installed from the embedded app's Help dialog opens this page. The page forwards each `job-application-bookmarklet` message from the posting tab into the frame and the frame's `job-application-ack` back to that tab. The message names must match job-applications-next's `src/app/utils/bookmarklet.utils.ts`
- A bookmarklet installed from the standalone app keeps opening `https://job-hunt.vigilant-broccoli.app`; reinstall it from Help inside this page. Each click opens a new manager tab, and a logged-out manager drops the posting after the bookmarklet's 15 seconds of retries
