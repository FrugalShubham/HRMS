# HRFlow AI

Production-ready multi-tenant SaaS HRMS platform with WhatsApp-first employee self-service and AI-powered HR automation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront / ALB                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼────────┐                      ┌─────────▼────────┐
│  React SPA     │                      │  Express API     │
│  (S3/CloudFront)│◄──── REST/JWT ─────►│  (ECS/Fargate)   │
└────────────────┘                      └─────────┬────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
            ┌───────▼───────┐            ┌────────▼────────┐           ┌────────▼────────┐
            │   MongoDB     │            │     AWS S3      │           │  Redis (cache)  │
            │  (Atlas)      │            │  (files/selfie) │           │  sessions/queue │
            └───────────────┘            └─────────────────┘           └─────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐    ┌──────▼──────┐  ┌─────▼─────┐
│Razorpay│    │   Stripe    │  │ WhatsApp  │
│        │    │             │  │ Cloud API │
└────────┘    └─────────────┘  └───────────┘
```

## Monorepo Structure

```
HRMS/
├── docs/                 # Architecture, API, RBAC, ER diagrams
├── backend/              # Node.js + Express + MongoDB
├── frontend/             # React + TypeScript + Vite
├── docker-compose.yml
└── .github/workflows/    # CI/CD
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (or Docker)
- Redis 7+ (optional, for refresh tokens)

### Local Development

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start infrastructure
docker compose up -d mongodb redis

# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

- API: http://localhost:5000/api/v1
- App: http://localhost:5173
- API Docs: http://localhost:5000/api/v1/docs

### Default Super Admin (seed)

After `npm run seed` in backend:

- Email: `superadmin@hrflow.ai`
- Password: `SuperAdmin@123`

## Subscription Plans

| Plan | Price | Employees | Key Features |
|------|-------|-----------|--------------|
| Free Trial | ₹0 / 14 days | 10 | Attendance, Leave, Dashboard |
| Starter | ₹999/mo | 50 | + Employee Management |
| Professional | ₹2999/mo | 200 | + Payroll, WhatsApp, Reports |
| Business | ₹5999/mo | 1000 | + AI, Recruitment, Geo-fencing |
| Enterprise | Custom | Unlimited | White-label, API, Support |

## Documentation

| Document | Path |
|----------|------|
| Database Schema | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) |
| ER Diagram | [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) |
| REST API | [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) |
| RBAC Matrix | [docs/RBAC_PERMISSIONS.md](docs/RBAC_PERMISSIONS.md) |
| Multi-Tenant Design | [docs/MULTI_TENANT_DESIGN.md](docs/MULTI_TENANT_DESIGN.md) |
| Security | [docs/SECURITY.md](docs/SECURITY.md) |
| Deployment | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

## License

Proprietary — HRFlow AI © 2026
