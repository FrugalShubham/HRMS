# Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Client->>API: POST /auth/login {email, password}
    API->>DB: Find user + verify bcrypt
    API-->>Client: accessToken (JSON) + refreshToken (httpOnly cookie)
    Client->>API: GET /employees (Authorization: Bearer accessToken)
    API->>API: verify JWT, tenantMiddleware, authorize()
    API-->>Client: tenant-scoped data

    Note over Client,API: Access token expires (15m)
    Client->>API: POST /auth/refresh (cookie)
    API->>DB: Validate refreshTokenVersion
    API-->>Client: New access + refresh tokens (rotation)

    Client->>API: POST /auth/logout
    API->>DB: increment refreshTokenVersion
    API-->>Client: Clear cookie
```

## RBAC Enforcement Layers

1. **JWT** — role, companyId, employeeId in claims
2. **tenantMiddleware** — binds company, checks suspended status
3. **requireFeature** — subscription feature flags
4. **authorize(permission)** — role → permission map
