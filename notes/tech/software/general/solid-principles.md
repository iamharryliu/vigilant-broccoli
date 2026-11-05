# SOLID Principles

| Principle | Meaning | Violation Smell | Fix |
| --- | --- | --- | --- |
| Single Responsibility (SRP) | A module has one reason to change. | A class that validates, persists and formats output. | Split by responsibility into focused modules. |
| Open/Closed (OCP) | Open for extension, closed for modification. | Adding a variant means editing a growing `switch`/`if` chain. | Use polymorphism, strategy or plugins so new behaviour is added, not edited in. |
| Liskov Substitution (LSP) | Subtypes must be usable wherever the base type is expected without breaking behaviour. | A subclass throws on an inherited method or tightens preconditions. | Prefer composition, or redesign the hierarchy so contracts hold. |
| Interface Segregation (ISP) | Clients should not depend on methods they do not use. | Implementers stub out unused methods of a fat interface. | Split into small, role-specific interfaces. |
| Dependency Inversion (DIP) | Depend on abstractions, not concretions; high-level code does not import low-level details. | Business logic constructs a database client or HTTP library directly. | Inject dependencies through interfaces or parameters. |
