# Web application READMEs

Web application and demo cards open `/web-applications/:app` detail pages. Each detail page shows an external **Open application** card above the existing shared README viewer, with loading and error states and a source link to GitHub. Breadcrumbs return to Web Applications and the document title uses the app name.

`src/app/consts/webApplications.json` holds each app’s stable id, launch URL, translation keys and repository-relative `readmePath`. Career shares the pages-index README because it is served by that app. Unknown ids show the shared unknown-item message. README fetch failures leave the launch card available.
