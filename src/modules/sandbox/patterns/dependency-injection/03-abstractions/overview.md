# 03 — Abstractions (Programming to Interfaces)

Dependencies are coded against **interfaces** (`INoteRepository`, `INoteService`) rather than concrete classes. The composition root decides which implementation to wire in.

## Pros

- **Loose coupling** — classes depend on abstractions, not concrete implementations. Swapping a `MemoryNoteRepository` for a `PostgresNoteRepository` requires zero changes to the service or controller.
- **Testability** — mock or stub implementations can be passed in tests without side effects or infrastructure.
- **Open/Closed Principle** — new implementations can be added without modifying existing consumers.
- **Team scalability** — different team members can work on the interface contract and implementations independently.
- **Contract clarity** — interfaces serve as a clear API boundary between layers.

## Cons

- **Indirection overhead** — every call goes through an interface dispatch, adding a minor runtime cost (usually negligible).
- **More files** — interfaces, implementations, and DTOs each live in separate files or modules, increasing project structure complexity.
- **Over-engineering risk** — if you only ever have one implementation, an interface adds ceremony without benefit (YAGNI).
- **Tooling friction** — "Go to implementation" requires an extra step compared to direct concrete references.

## When to use

Use when you have (or anticipate) multiple implementations of the same contract, when testing requires swapping real dependencies, or in large codebases where module boundaries must be strictly enforced.
