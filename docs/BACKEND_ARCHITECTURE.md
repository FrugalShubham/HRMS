# Backend Architecture

## Layers

```
Routes → Middleware → Services → Models (Mongoose)
```

| Layer | Responsibility |
|-------|----------------|
| Routes | HTTP mapping, Zod validation |
| Middleware | auth, tenant, feature, audit, rate limit |
| Services | Business logic, external APIs |
| Models | Schema, indexes, references |

## Key Services

| Service | Integrations |
|---------|--------------|
| auth.service | bcrypt, JWT |
| attendance.service | geo utils, S3 selfies |
| whatsapp.service | Meta Cloud API |
| ai.service | OpenAI |
| payment.service | Razorpay, Stripe |
| s3.service | AWS S3 presigned URLs |
| platform.service | Super admin ops |

## Multi-Tenant

Every tenant route uses `tenantMiddleware` → `req.tenantId` from JWT (never body).

`getTenantFilter(req)` returns `{ companyId }` for queries.

## Scaling Notes

- Stateless API → horizontal ECS scaling
- MongoDB compound indexes on `companyId`
- Redis recommended for refresh token blacklist + job queues (Bull)
- WhatsApp webhooks should move to queue at high volume
