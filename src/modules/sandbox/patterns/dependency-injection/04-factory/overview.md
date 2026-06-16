# 04 — Factory Pattern

A `NoteServiceFactory` encapsulates the creation logic for the service and its dependency graph. The composition logic moves from the route file into a dedicated factory, which can make decisions based on configuration.

## Pros

- **Encapsulated creation** — the factory owns the "how" of object construction. The caller just asks for an instance.
- **Configuration-driven** — the factory can switch implementations based on environment config (memory vs. postgres, logging on/off, etc.) without changing consumers.
- **Reusable** — the same factory can be called from routes, tests, or scripts to get a correctly-wired service every time.
- **Single point of change** — adding a new dependency means editing the factory, not every call site.

## Cons

- **Factory explosion** — a factory per aggregate can lead to many factory classes, each with similar wiring code.
- **Hidden complexity** — the constructor graph is no longer visible at the call site. Developers must open the factory to see what's being created.
- **No lifecycle management** — the factory typically creates new instances on every call. Managing singletons or scoped instances requires additional bridging code.
- **Still manual** — the factory itself must be maintained; it's just a refactoring of the manual wiring, not an elimination of it.
