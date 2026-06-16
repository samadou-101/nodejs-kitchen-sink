# Basic Dependency Injection (Manual / Poor Man's DI)

Dependencies are passed explicitly via constructors, wired manually in a composition root (`route.ts`). No DI container or framework is used.

## Pros

- **Zero dependencies** — no DI framework, no decorators, no reflection. Works with any runtime or transpiler.
- **Explicit & transparent** — every dependency is visible in the constructor signature. No magic, no hidden resolution.
- **Testable** — each class can be instantiated with mocks/stubs in tests by simply passing alternatives to the constructor.
- **Simple to understand** — follows plain OOP. No new concepts to learn beyond constructors and interfaces.
- **Full control** — no container lifecycle to debug. You decide when and how objects are created.
- **Refactor-friendly** — IDEs can easily trace constructor parameters and find all call sites.

## Cons

- **Manual boilerplate** — every dependency must be manually instantiated and passed. As the graph grows, the composition root becomes verbose and tedious to maintain.
- **No lifecycle management** — no built-in support for singletons, scoped instances, or lazy resolution. You must implement these yourself.
- **No auto-resolution** — adding a new dependency to a constructor means updating every call site that instantiates that class (unless you already funnel through a composition root).
- **Scales poorly** — with dozens or hundreds of classes, the manual wiring becomes error-prone and hard to reason about.
- **No AOP support** — no easy way to inject cross-cutting concerns (logging, caching, transactions) without modifying every class.
- **No circular dependency detection** — circular references compile and run fine but blow up at runtime with stack overflow, with no container to detect and break the cycle.
