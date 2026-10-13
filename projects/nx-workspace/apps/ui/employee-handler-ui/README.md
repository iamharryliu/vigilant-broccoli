# Employee Handler UI

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Stack](#stack)

## Deployment URLs

- [Demo](https://demo-employee-handler-ui.vercel.app/) — the only Vercel deploy (`deploy:demo`); `deploy` and `deploy:production` still push the Docker image

## Stack

- Language - TypeScript
- Framework - Next.js (React)
- Build Tool - Next.js
- External libs
  - Tailwind CSS, lucide-react icons
  - Nodemailer
  - isomorphic-dompurify
- Internal libs
  - `common-js`
  - `employee-handler`
  - `react-lib`
- Cloud services
  - Supabase (auth)
  - Google APIs
  - Vercel
  - Docker Hub (`iamharryliu/employee-handler-next`)
