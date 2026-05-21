## ADDED Requirements

### Requirement: Vite dev proxy forwards API requests to backend
The system SHALL configure the Vite dev server to proxy all requests matching `/api/*` to the backend Express server running on `http://localhost:3000`.

#### Scenario: API request is proxied in dev
- **WHEN** the frontend dev server is running and a request is made to `/api/ecom/products`
- **THEN** the request is forwarded to `http://localhost:3000/api/ecom/products` and the response is returned to the frontend

#### Scenario: Non-API requests are not proxied
- **WHEN** the frontend dev server receives a request for a static asset or a client-side route
- **THEN** the request is handled by Vite's dev server and not forwarded to the backend

### Requirement: Backend CORS accepts Vite dev server origin
The system SHALL configure the Express backend to accept cross-origin requests from the Vite dev server origin (`http://localhost:5173`) with credentials enabled.

#### Scenario: CORS allows credentialed requests from Vite origin
- **WHEN** the frontend at `http://localhost:5173` makes a fetch request to the backend at `http://localhost:3000` with `credentials: "include"`
- **THEN** the backend responds with the appropriate CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, etc.)

#### Scenario: CORS blocks requests from unknown origins
- **WHEN** a request is made from an origin other than the configured Vite dev server
- **THEN** the backend does not include CORS headers for credentialed access

### Requirement: Frontend supports VITE_API_URL environment variable
The system SHALL support a `VITE_API_URL` environment variable in the frontend that sets the base URL for all API calls, enabling production deployment on a different origin.

#### Scenario: VITE_API_URL is set
- **WHEN** `VITE_API_URL` is defined (e.g., `https://api.example.com`)
- **THEN** all API calls are prefixed with this base URL instead of using relative paths

#### Scenario: VITE_API_URL is not set
- **WHEN** `VITE_API_URL` is not defined
- **THEN** API calls use relative paths (e.g., `/api/ecom/products`), relying on same-origin deployment or the Vite proxy
