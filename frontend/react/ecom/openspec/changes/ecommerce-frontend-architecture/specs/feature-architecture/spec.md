## ADDED Requirements

### Requirement: Features follow a three-layer structure
Every feature folder SHALL contain three subdirectories: `api/`, `hooks/`, and `components/`.

#### Scenario: Feature folder layout
- **WHEN** a developer creates a new feature
- **THEN** the folder structure SHALL be `features/<name>/api/`, `features/<name>/hooks/`, `features/<name>/components/`

### Requirement: API layer owns all Tanstack Query hooks
The `api/` folder SHALL contain all `useQuery` and `useMutation` calls for that feature. No other layer SHALL call Tanstack Query hooks directly.

#### Scenario: API layer isolation
- **WHEN** a UI component needs data
- **THEN** it SHALL import from a feature hook, not from the `api/` layer directly

### Requirement: Hooks layer orchestrates API and client state
The `hooks/` folder SHALL contain React hooks that consume API layer hooks and combine them with client-side state. Feature hooks are the public API consumed by components.

#### Scenario: Hook encapsulation
- **WHEN** a component needs data with loading/error states
- **THEN** it SHALL use a hook from `hooks/` that internally calls the `api/` layer

### Requirement: Components layer is presentation-only
The `components/` folder SHALL contain UI components that receive data via props or feature hooks. Components SHALL NOT import from `api/` directly.

#### Scenario: Component purity
- **WHEN** a component renders
- **THEN** it SHALL only receive data through props or feature-level hooks

### Requirement: Shared code lives in `src/shared/`
Cross-cutting concerns SHALL live in `src/shared/` with subfolders: `api/`, `hooks/`, `components/`, `lib/`.

#### Scenario: Shared imports
- **WHEN** multiple features need the same utility
- **THEN** it SHALL be placed in `src/shared/` and imported from there

### Requirement: Features cannot import from other features
A feature SHALL NOT import directly from another feature's `api/`, `hooks/`, or `components/`.

#### Scenario: Cross-feature isolation
- **WHEN** a developer tries to import from another feature's internal module
- **THEN** the lint rule SHALL flag this as an error

### Requirement: Tanstack Query is configured globally
The app SHALL wrap the component tree with a `QueryClientProvider` configured with sensible defaults (stale time, retry policy, refetch behavior).

#### Scenario: Global provider
- **WHEN** the app mounts
- **THEN** all Tanstack Query hooks have access to a pre-configured `QueryClient`

### Requirement: HTTP client is shared via a utility
All API calls SHALL go through a shared HTTP client utility that handles base URL, headers, and error normalization.

#### Scenario: HTTP client usage
- **WHEN** a feature API layer makes a request
- **THEN** it SHALL use the shared HTTP client instead of raw fetch
