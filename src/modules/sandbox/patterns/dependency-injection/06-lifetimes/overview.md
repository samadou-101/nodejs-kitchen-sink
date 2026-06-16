# 06 — Lifetimes (Singleton, Transient, Scoped)

An enhanced container (`LifetimeContainer`) supports three lifetime strategies:

- **Singleton** — one instance per container, shared across all consumers.
- **Transient** — a new instance every time `resolve` is called.
- **Scoped** — one instance per scope (e.g., per HTTP request). `createScope()` creates a child container that reuses parent singletons but has its own scoped cache.

A `ClockService` with a unique `instanceId` demonstrates instance identity.

## Pros

- **Resource optimization** — singletons conserve memory and share state (e.g., a single DB connection). Transients ensure fresh state where needed.
- **Request isolation** — scoped lifetimes provide per-request isolation for things like request context, unit of work, or per-request caching.
- **Explicit intent** — the lifetime of every dependency is declared at registration time, not inferred.
- **No global state** — scoped instances are tied to a container scope, not to a static global.

## Cons

- **Complexity** — developers must understand three lifetime strategies and their implications for state sharing and thread safety.
- **Singleton footgun** — stateful singletons can leak data across requests. Immutable or stateless singletons (like loggers) are safe; mutable ones require careful design.
- **Scoped disposal** — the container does not automatically dispose scoped instances at the end of the scope. Memory leaks are possible if scoped instances hold resources.
- **Container coupling** — the container must be passed around or made available via a request context to create scopes.
- **Debugging difficulty** — knowing whether you got a singleton or transient instance requires tracing registration metadata, not the code.

## When to use

Use when you need fine-grained control over object lifetimes — singletons for stateless services and shared infrastructure, transients for lightweight stateless workers, and scopes for request-scoped units of work.
