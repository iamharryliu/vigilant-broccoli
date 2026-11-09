# OAuth App Testing vs Production

## Table of Contents

- [Google Cloud OAuth Consent Screen](#google-cloud-oauth-consent-screen)
  - [Testing vs In Production](#testing-vs-in-production)
  - [Scope Verification](#scope-verification)
- [Supabase](#supabase)
  - [Production Checklist](#production-checklist)

## Google Cloud OAuth Consent Screen

Set under Google Auth Platform → [Audience](https://console.cloud.google.com/auth/audience). The user type is either Internal (Google Workspace org accounts only, no verification or test-user list) or External (any Google account); publishing status applies to External apps.

### Testing vs In Production

| Aspect | Testing | In Production |
| --- | --- | --- |
| Branding | App name shown; logo hidden until brand verification. | Same; brand verification is required to display the logo. |
| Consent screen warning | Test users see the "Google hasn't verified this app" screen and can continue. | Shown only while sensitive or restricted scopes are unverified. |
| Refresh token lifetime | Expires after 7 days unless the only scopes are `openid`, `email` and `profile`. | Long-lived until revoked, unused for 6 months or the password changes (Gmail scopes). |
| Switching | Click **Publish app**. | Click **Back to testing**; existing non-test users lose sign-in access. |
| Use for | Local development and private demos. | Any public sign-in. |
| Verification | Not required. | Required for sensitive or restricted scopes; unverified apps keep a 100-user lifetime cap. |
| Who can sign in | Only accounts on the test-user list (max 100). | Any Google account. |

### Scope Verification

| Scope Type | Examples | Requirement to Publish |
| --- | --- | --- |
| Non-sensitive | `openid`, `email`, `profile` | None; publishing takes effect immediately. |
| Sensitive | Calendar, Drive per-file, Contacts | Google review with privacy policy, homepage and demo video. |
| Restricted | Gmail read, Drive full access | Google review plus an annual third-party security assessment. |

## Supabase

Supabase has no testing/published toggle; Google sign-in through Supabase Auth inherits the Google consent screen status above, and Supabase's own defaults are development-grade.

| Aspect | Development Default | Production Setup |
| --- | --- | --- |
| Auth emails (SMTP) | Built-in SMTP sends only to project team members, with a low hourly rate limit. | Configure custom SMTP (e.g. Resend, SES, Postmark) and raise the rate limit. |
| Consent screen domain | Google shows `<project-ref>.supabase.co` as the redirect domain. | Custom domain add-on (paid) so the consent screen shows your domain. |
| Database access | Tables created in the SQL editor have RLS off. | Enable RLS on every exposed table and add policies. |
| Project activity | Free projects pause after 7 days of inactivity. | Paid plan to avoid pausing and get daily backups. |
| Redirect URLs | Site URL defaults to `http://localhost:3000`. | Set Site URL and the redirect allowlist to production URLs; drop wildcards. |

### Production Checklist

- Enable MFA on the Supabase organization and owner accounts.
- Enable SSL enforcement and network restrictions under Database settings.
- Turn on email confirmation and leaked-password protection under Auth settings.
- Add CAPTCHA protection to sign-up and sign-in.
- Review the Security and Performance Advisors in the dashboard.
