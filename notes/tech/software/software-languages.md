# Software Languages

| Language             | Primary Use Cases                                            | Type / Paradigm                                           | Compiled or Interpreted       | Memory Management                  | Notable Features                             |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------- | ---------------------------------- | -------------------------------------------- |
| **Python**           | Data science, automation, web dev, AI                        | High-level, interpreted, multi-paradigm (OOP, functional) | Interpreted                   | Garbage-collected                  | Huge standard library, readable syntax       |
| **JavaScript**       | Web front-end, back-end (Node.js), mobile apps               | High-level, event-driven, functional + OOP                | Interpreted (JIT in browsers) | Garbage-collected                  | Runs in browsers, asynchronous I/O           |
| **TypeScript**       | Web + server development, large-scale JS apps                | Superset of JavaScript with static typing                 | Transpiled to JS              | Garbage-collected                  | Type safety, tooling support                 |
| **Java**             | Enterprise apps, Android, backend systems                    | Object-oriented, class-based                              | Compiled to JVM bytecode      | Garbage-collected                  | Platform-independent (JVM), strong typing    |
| **C#**               | Desktop, game dev (Unity), enterprise                        | Object-oriented, component-based                          | Compiled to .NET IL           | Garbage-collected                  | Part of .NET ecosystem, LINQ                 |
| **C++**              | Systems programming, game engines, performance-critical apps | Multi-paradigm (procedural, OOP)                          | Compiled                      | Manual (RAII)                      | Low-level control, high performance          |
| **C**                | Operating systems, embedded systems, hardware-level dev      | Procedural, low-level                                     | Compiled                      | Manual                             | Small runtime, close to hardware             |
| **Go (Golang)**      | Cloud services, networking, concurrent apps                  | Compiled, statically typed                                | Compiled                      | Garbage-collected                  | Fast builds, goroutines, simplicity          |
| **Rust**             | Systems programming, secure and concurrent apps              | Compiled, statically typed                                | Compiled                      | Ownership model (no GC)            | Memory safety without GC                     |
| **Ruby**             | Web apps, automation, scripting                              | High-level, interpreted, OOP                              | Interpreted                   | Garbage-collected                  | Simple syntax, convention over configuration |
| **PHP**              | Web backend scripting                                        | High-level, interpreted                                   | Interpreted                   | Garbage-collected                  | Deep web integration, simple deployment      |
| **Swift**            | iOS/macOS apps                                               | Compiled, statically typed                                | Compiled                      | Automatic Reference Counting (ARC) | Safe, fast, modern syntax                    |
| **Kotlin**           | Android, backend, multiplatform                              | Statically typed, modern JVM language                     | Compiled to JVM or native     | Garbage-collected                  | Interoperable with Java                      |
| **SQL**              | Database queries, data manipulation                          | Declarative                                               | Interpreted (DB engine)       | Managed by DB                      | Set-based operations                         |
| **R**                | Statistics, data visualization, data analysis                | High-level, functional                                    | Interpreted                   | Garbage-collected                  | Statistical modeling, visualization          |
| **Shell (Bash/Zsh)** | Automation, system scripts                                   | Scripting, procedural                                     | Interpreted                   | N/A                                | Command-line integration                     |
| **Perl**             | Text processing, sysadmin scripts                            | Scripting, multi-paradigm                                 | Interpreted                   | Garbage-collected                  | Powerful regex, flexible syntax              |
| **Scala**            | Big data, functional JVM apps                                | Functional + OOP                                          | Compiled to JVM               | Garbage-collected                  | Expressive, integrates with Java             |
| **Dart**             | Cross-platform apps (Flutter)                                | Object-oriented                                           | JIT + AOT compiled            | Garbage-collected                  | Designed for UI dev                          |
| **MATLAB**           | Engineering, simulation, numeric computing                   | Procedural + functional                                   | Interpreted                   | Managed                            | Built-in matrix ops, visualization           |
| **Haskell**          | Functional programming, research                             | Purely functional                                         | Compiled                      | Garbage-collected                  | Immutability, type inference                 |
| **Elixir**           | Scalable, concurrent web services                            | Functional (Erlang VM)                                    | Compiled to BEAM bytecode     | Garbage-collected                  | Fault tolerance, concurrency                 |
| **Lua**              | Game scripting, embedded systems                             | Lightweight, procedural                                   | Interpreted                   | Garbage-collected                  | Embeddable, fast                             |

| Python                        | Typescript                             |
| :---------------------------- | :------------------------------------- |
| for i, num in enumerate(nums) | for (const [i, num] of nums.entries()) |
| hmap.values()                 | hmap.values()                          |
| hmap = {}                     | const hmap = {}                        |
| len(arr)                      | arr.length                             |
| arr.pop()                     | arr.pop()                              |
| arr.append(x)                 | arr.push(x)                            |
| not                           | !                                      |
| or                            | \|\|                                   |
| ==                            | ===                                    |
| !=                            | !==                                    |
| float("inf")                  | Infinity                               |
| float("-inf")                 | -Infinity                              |
| max(n1, n2..)                 | Math.max(n1, n2..)                     |
| min(n1, n2..)                 | Math.min(n1, n2..)                     |
| s.isalnum()                   | /^[A-Za-z0-9]+$/.test(s);              |
