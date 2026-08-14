# Supabase

Open-source Postgres backend-as-a-service: managed Postgres plus Auth, Storage, Realtime, and Edge Functions. Used by [hearth](../../../../../projects/nx-workspace/apps/hearth/README.md) for auth + data.

## Free Tier

Applies to the Free plan; limits are per-organization unless noted and can change — verify against the [pricing page](https://supabase.com/pricing).

| Service                   | Free Tier Limit                               | Notes                                        |
| ------------------------- | --------------------------------------------- | -------------------------------------------- |
| Projects                  | 2 active                                      | Extra projects require a paid org            |
| Project pausing           | Paused after 7 days inactivity                | Restore manually from the dashboard          |
| Database size             | 500 MB / project                              | Disk auto-scales only on paid plans          |
| Auth (MAUs)               | 50,000 monthly active users                   | Third-party MAUs billed separately           |
| File storage              | 1 GB                                          | 50 MB max per file                           |
| Egress (bandwidth)        | 5 GB / month                                  | Combined DB + storage + realtime + functions |
| Edge Function invocations | 500,000 / month                               | —                                            |
| Realtime                  | 200 concurrent connections, 2M messages/month | —                                            |
| Backups                   | None                                          | Daily backups start on Pro                   |
| Support                   | Community only                                | —                                            |

## References

- [Pricing](https://supabase.com/pricing)
- [Usage-based billing docs](https://supabase.com/docs/guides/platform/manage-your-usage)
