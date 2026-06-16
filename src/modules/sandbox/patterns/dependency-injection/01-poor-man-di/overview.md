# 01 — Poor Man's DI (with Logger Cross-Cutting)

Extends the basic DI pattern by adding a `Logger` dependency as a cross-cutting concern. Every class now depends on both its logical dependency (repo / service) and a logger. All wiring remains manual in the composition root (`route.ts`).

## Pros

- **Cross-cutting explicit** — logging is injected like any other dependency, not hidden in global state or static methods.
- **Testable logging** — logger can be mocked or replaced with a test spy in unit tests.
- **Still zero dependencies** — no framework, no decorators, no magic.
- **Swap implementations easily** — swap `ConsoleLogger` for `FileLogger` or `JsonLogger` without touching business logic.

## Cons

- **Constructor pollution** — every class now takes one more parameter just for logging. With 3–4 cross-cutting concerns, constructors become unwieldy.
- **Manual wiring grows** — logger must be instantiated and passed everywhere in the composition root.
- **No AOP** — cross-cutting concerns like logging, metrics, and tracing must be manually threaded through every layer rather than applied declaratively.
- **Boilerplate duplication** — every method wraps its logic with `this.logger.info(...)` / `this.logger.error(...)` calls.
