# Swagger Metrics — Flow Diagrams

## 1. Page Routing and Initialization
```mermaid
flowchart TD
  A[Browser Loads index.html] --> B[Router initApp]
  B --> C{Hash route?}
  C -->|valid| D[Fetch HTML partial]
  C -->|invalid| E[Fallback to Home]
  D --> F[Inject into #app-content]
  F --> G{init<page> exists?}
  G -->|yes| H[Run page initializer]
  G -->|no| I[Render page as static]
  D -->|error| J[Show load error message]
```

## 2. Standard Page Data Flow
```mermaid
flowchart TD
  A[User opens page] --> B[Default inputs set]
  B --> C[Load data call]
  C --> D[apiGet /api/*]
  D --> E[Proxy to upstream API]
  E --> F[Response JSON]
  F --> G[Cache rows]
  G --> H[Render summary]
  G --> I[Render table]

  J[User filters/searches] --> K[Filter cached rows]
  K --> H
  K --> I

  L[User exports] --> M[Confirm export?]
  M --> N[Generate file]
```

## 3. Tree Endpoints Hash Logic
```mermaid
flowchart TD
  A[Incoming request to /api/* tree endpoint] --> B{accounthash provided?}
  B -->|yes| C[Use accounthash]
  B -->|no| D{username provided?}
  D -->|yes| E[MD5(username)]
  D -->|no| F[Use ROOT_HASH]
  C --> G[Call upstream API]
  E --> G
  F --> G
  G --> H[Return JSON response]
```
