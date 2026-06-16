# 05 — DI Container

A lightweight, purpose-built DI container (`Container`) manages dependency registration and resolution. Dependencies are registered as factories, and the container auto-wires the graph by resolving each dependency on demand.

## Pros

- **Centralized wiring** — all dependencies are registered in a single container, making the full graph visible in one place.
- **Auto-resolution** — the container chains factory calls, so adding a new dependency means adding one registration (and one constructor parameter), not updating every call site.
- **Singleton support built-in** — `resolveSingleton` returns the same instance every time, giving basic lifecycle management.
- **Easy to test** — the container can be replaced or pre-populated with mocks in integration tests.
- **Scales** — works well for dozens or hundreds of registered types.

## Cons

- **Runtime resolution** — errors from missing registrations or circular dependencies only surface at runtime, not at compile time.
- **Magic strings** — keys are strings, not types. No compile-time guarantee that a key exists or resolves to the correct type.
- **No scope management** — the simple container supports only singletons and transients. Scoped lifetimes (per-request) must be added manually.
- **Container lock-in** — application code becomes coupled to the container if it's passed around or used outside the composition root.
- **Debugging overhead** — stack traces include container machinery, making it harder to trace where a dependency was created.

## When to use

Use when the dependency graph is large enough that manual wiring becomes tedious, but you don't want the weight of a full DI framework like inversify or tsyringe.
