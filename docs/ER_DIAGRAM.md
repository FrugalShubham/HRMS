# HRFlow AI — Entity Relationship Diagram

```mermaid
erDiagram
    COMPANIES ||--o{ USERS : employs
    COMPANIES ||--o{ EMPLOYEES : has
    COMPANIES ||--|| SUBSCRIPTIONS : has
    PLANS ||--o{ SUBSCRIPTIONS : defines
    COMPANIES ||--o{ DEPARTMENTS : has
    COMPANIES ||--o{ DESIGNATIONS : has
    DEPARTMENTS ||--o{ EMPLOYEES : contains
    DESIGNATIONS ||--o{ EMPLOYEES : assigns
    EMPLOYEES ||--o{ ATTENDANCE : records
    EMPLOYEES ||--o{ LEAVE_REQUESTS : submits
    LEAVE_TYPES ||--o{ LEAVE_REQUESTS : categorizes
    EMPLOYEES ||--o{ LEAVE_BALANCES : holds
    EMPLOYEES ||--o{ PAYROLLS : receives
    PAYROLLS ||--o{ PAYSLIPS : generates
    COMPANIES ||--o{ HOLIDAYS : declares
    COMPANIES ||--o{ ANNOUNCEMENTS : publishes
    COMPANIES ||--o{ ASSETS : owns
    ASSETS ||--o{ ASSET_ALLOCATIONS : tracks
    COMPANIES ||--o{ RECRUITMENTS : posts
    RECRUITMENTS ||--o{ CANDIDATES : receives
    COMPANIES ||--o{ PAYMENTS : makes
    PAYMENTS ||--o{ INVOICES : issues
    USERS ||--o{ AUDIT_LOGS : triggers

    COMPANIES {
        ObjectId _id PK
        string name
        string slug
        string status
        object features
        object settings
    }

    USERS {
        ObjectId _id PK
        ObjectId companyId FK
        string email
        string role
    }

    EMPLOYEES {
        ObjectId _id PK
        ObjectId companyId FK
        string employeeNumber
        ObjectId departmentId FK
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId companyId FK
        ObjectId employeeId FK
        date date
        string status
        string source
    }

    LEAVE_REQUESTS {
        ObjectId _id PK
        ObjectId companyId FK
        ObjectId employeeId FK
        string status
    }

    SUBSCRIPTIONS {
        ObjectId _id PK
        ObjectId companyId FK
        ObjectId planId FK
        date expiresAt
    }
```

## Multi-Tenant Isolation

Every query from tenant context MUST include `companyId` filter injected by `tenantMiddleware` from JWT claims — never from client body alone.
