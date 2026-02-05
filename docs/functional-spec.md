# Swagger Metrics — Functional Specification

## 1. Purpose and Scope
Swagger Metrics is a lightweight, single-page, API-driven dashboard for viewing user, sales, code, and network tree data. It provides filtering, search, summary metrics, and export tools for multiple datasets sourced from upstream APIs.

## 2. High-Level Architecture
- **Frontend SPA**: Hash-based routing loads HTML partials into a single main content region.
- **Client API Layer**: `apiGet` performs same-origin `/api/*` requests and parses JSON.
- **Shared Utilities**: Table rendering, date helpers, and export helpers (CSV/XLSX/PDF).
- **Serverless Proxy**: `/api/*` routes proxy to upstream APIs and normalize select responses.
- **Local Dev Proxy**: Express proxy for local testing (CORS open).

## 3. Navigation and Routing
- Route changes are driven by hash (e.g., `#sales`, `#userUpline`).
- On route load, the router fetches the HTML partial and injects it into `#app-content`.
- If a page has a page initializer (e.g., `initSalesPage`), it is called after load.
- If fetch fails, a user-friendly error message is displayed.

## 4. Global Behaviors
- **Default Date Range**: last 7 days, applied on date-filter pages.
- **API Key Generation**: `hhyyyymmdd` from local time; used by all API calls.
- **Table Rendering**: shared table renderer builds `<table>` from column definitions.
- **Search**: case-insensitive search within current in-memory results.
- **Export**:
  - CSV: always available if rows exist.
  - XLSX: requires `xlsx` library.
  - PDF: opens a print window; requires pop-ups to be allowed.
  - Optional confirmation dialogs via SweetAlert2 if present.

## 5. Functional Requirements by Page

### 5.1 Home
- Displays static summary cards.
- No API calls.

### 5.2 Users
- Inputs: `From`, `To` date.
- Fetches `/api/users` with `df`, `dt`, `user`, `apikey`.
- Renders summary counts: total, active, silver, gold, platinum.
- Table search, clear search, and export.

### 5.3 Codes
- Inputs: `From`, `To` date.
- Fetches `/api/codes` with `df`, `dt`, `user`, `apikey`.
- Renders summary: total codes.
- Table search, clear search, and export.

### 5.4 Sales
- Inputs: `From`, `To` date.
- Fetches `/api/sales` with `df`, `dt`, `user`, `apikey`.
- Renders summary: transaction count, total amount, total qty, distinct stores.
- Table search, clear search, and export.

### 5.5 User Upline
- Input: optional `username`.
- Fetches `/api/userUpline` with `user`, `apikey`, optional `username` (server derives hash).
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.6 Sponsored Downline
- Input: optional `username`.
- Fetches `/api/sponsoredDownline` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.7 Binary Downline
- Input: optional `username`.
- Fetches `/api/binaryDownline` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.8 Unilevel Downline
- Input: optional `username`.
- Fetches `/api/unilevelDownline` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.9 Unilevel Upline
- Input: optional `username`.
- Fetches `/api/unilevelUpline` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.10 Personal Accounts
- Input: optional `username`.
- Fetches `/api/personalAccounts` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.11 Network Activity
- Input: optional `username`.
- Fetches `/api/networkActivity` with `user`, `apikey`, optional `username`.
- Renders summary: total nodes.
- Table search, clear search, and export.

### 5.12 MLM Swagger
- Static HTML API documentation page.
- No API calls; no initializer required.

## 6. API Proxy Requirements
- All `/api/*` endpoints forward to `https://gmin.onegrindersguild.com/*`.
- For tree endpoints, the server derives `accounthash` as:
  - If `accounthash` provided: use as is.
  - Else if `username` provided: `md5(username)`.
  - Else: use fixed ROOT hash constant (per endpoint).
- `/api/codes` normalizes empty response bodies to `{ data: [] }`.

## 7. Error Handling and Edge Cases
- Router shows a friendly error when a page fails to load.
- API failures show an empty-state message and log errors to console.
- Empty API results show empty state; summary cards cleared.
- Search operates only on loaded data, not server-side.
- Export actions prevent export when there are no rows.
- PDF export fails if pop-ups are blocked; user is alerted.

## 8. Non-Functional Requirements
- Runs entirely in browser; minimal dependencies.
- Accessible labels for inputs and buttons.
- No authentication UI; API key generation is time-based and client-side.

## 9. Out of Scope
- User management, authentication, and role-based access.
- Persistent user preferences.
- Server-side pagination or filtering beyond upstream API parameters.

