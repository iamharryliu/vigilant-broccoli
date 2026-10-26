# Job Hunt

## Overview

- `/job-hunt` page (sidebar entry `SIDEBAR_ROUTE.JOB_HUNT` with a `ClipboardList` icon, below Career 2) fills the content area with an iframe of [job-applications-next](../../../job-applications-next/README.md) at `LOCAL_HOST_URL.JOB_HUNT` (`https://job-hunt.vigilant-broccoli.app`), the app's Docker container behind the local k3s ingress
- The iframe has `allow="clipboard-write"` so the embedded app's Copy buttons work
- The embedded app must allow the manager in its `JOB_APPLICATIONS_FRAME_ANCESTORS`; `pnpm job-applications:docker:up` sets it
