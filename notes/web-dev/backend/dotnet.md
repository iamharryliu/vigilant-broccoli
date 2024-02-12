# Dotnet

```
dotnet run
dotnet ef dbcontext Scaffold "Server=localhost,1401;Initial Catalog=AdventureWorksLT2022;Persist Security Info=False;User ID=SA;Password=password1!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;" Microsoft.EntityFrameworkCore.SqlServer -o Model
```

- [Restore DB Video](https://www.youtube.com/watch?v=7ICbhjbPUhI)
- [Restore DB using Azure Data Studio](https://www.quackit.com/sql_server/mac/how_to_restore_a_bak_file_using_azure_data_studio.cfm)
- [Restore SQL Server DB in a Linux Docker Container](https://learn.microsoft.com/en-us/sql/linux/tutorial-restore-backup-in-sql-server-container?view=sql-server-ver16&tabs=prod)
- [Generating a model from an existing database](https://www.learnentityframeworkcore.com/walkthroughs/existing-database)

## Improvements

- api
  - more endpoints + structure
- ui
  - use ts for React app
  - Radio button group for filter buttons
