# Multi-Tenant Design

## Strategy: Shared Database, Shared Schema

- Single MongoDB cluster, all collections include `companyId`
- Super Admin routes bypass tenant filter with explicit guards
- Row-level isolation enforced in middleware + repository layer

## Tenant Resolution

1. **JWT** — `companyId` in access token for tenant users
2. **Subdomain** — `acme.hrflow.ai` → resolve slug → companyId (optional)
3. **Header** — `X-Tenant-Id` for API integrations (Enterprise)

## Feature Gating

```typescript
features: {
  attendance: true,
  leave: true,
  payroll: false,
  whatsapp: true,
  aiAssistant: false,
  geoFencing: true,
  // ...
}
```

`requireFeature('payroll')` middleware blocks API if plan disabled.

## Scaling for 10K+ Companies / 1M+ Employees

| Layer | Approach |
|-------|----------|
| MongoDB | Sharding key `companyId`; read replicas |
| API | Horizontal ECS tasks behind ALB |
| Cache | Redis: plan features, session, rate limits per tenant |
| Files | S3 prefix `companies/{companyId}/` |
| Analytics | Aggregated metrics collection, nightly rollups |
| WhatsApp | Queue webhooks (Bull/SQS) for burst traffic |

## Subscription Enforcement

- `employeeCount` checked on create employee
- Grace period 3 days after expiry before read-only mode
- Suspended companies: 403 on all tenant APIs
