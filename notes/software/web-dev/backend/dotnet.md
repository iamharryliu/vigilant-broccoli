# Dotnet

```
# Setup new app.
dotnet new [webapp|razor|classlib|console]
dotnet run

# Create database models.
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet ef -h
dotnet tool install --global dotnet-ef
dotnet ef dbcontext Scaffold "Server=localhost,1401;Initial Catalog=AdventureWorksLT2022;Persist Security Info=False;User ID=SA;Password=password1!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;" Microsoft.EntityFrameworkCore.SqlServer -o Model
 dotnet ef dbcontext scaffold "Server=.\;Database=AdventureWorksLT2012;Trusted_Connection=True;" Microsoft.EntityFrameworkCore.SqlServer -o Model
 dotnet ef dbcontext scaffold "Server=.\;Database=AdventureWorksLT2012;Trusted_Connection=True;" Microsoft.EntityFrameworkCore.SqlServer -o Model -c "AdventureContext"

# Swagger
http://localhost:5290/swagger/index.html
```

## References

- [Restore DB Video](https://www.youtube.com/watch?v=7ICbhjbPUhI)
- [Generating a model from an existing database](https://www.learnentityframeworkcore.com/walkthroughs/existing-database)d
