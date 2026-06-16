# 02 — Multiple Dependencies

Demonstrates a class with **three** constructor dependencies: `NoteRepository`, `Logger`, and `Notifier`. The service notifies an admin whenever a note is created, updated, or deleted. Wiring remains manual.

## Pros

- **Realistic example** — most services need more than one collaborator (database, logger, notifications, caching, etc.).
- **Clear dependency graph** — the constructor signature documents every external need explicitly.
- **Granular testability** — each dependency can be mocked independently for targeted tests.

## Cons

- **Constructor explosion** — as more concerns are added, the constructor grows proportionally. A service with 5–6 dependencies becomes hard to read and instantiate.
- **Brittle wiring** — the composition root must construct and pass every dependency in the correct order. Adding a dependency breaks every call site.
- **Ordering matters** — swapping parameter order by mistake is a runtime error that the type system may not catch if types are compatible.
- **No discoverability** — there is no central registry to discover what dependencies a class needs; you must inspect the constructor manually.

## When to use

Best for small to medium applications where each service has 2–3 dependencies and the team is small. For larger graphs, consider a DI container or factory pattern.
