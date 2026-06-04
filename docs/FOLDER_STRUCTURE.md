# HRFlow AI — Complete Folder Structure

```
HRMS/
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
├── README.md
├── .gitignore
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── AUTHENTICATION_FLOW.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   ├── ER_DIAGRAM.md
│   ├── FOLDER_STRUCTURE.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── MULTI_TENANT_DESIGN.md
│   ├── RBAC_PERMISSIONS.md
│   ├── SECURITY.md
│   └── WIREFRAMES.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── app.ts
│       ├── config/
│       │   ├── env.ts
│       │   └── permissions.ts
│       ├── types/index.ts
│       ├── models/          # 22 Mongoose schemas
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── tenant.ts
│       │   ├── audit.ts
│       │   ├── validate.ts
│       │   └── errorHandler.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── attendance.service.ts
│       │   ├── leave.service.ts
│       │   ├── payroll.service.ts
│       │   ├── whatsapp.service.ts
│       │   ├── ai.service.ts
│       │   ├── payment.service.ts
│       │   ├── platform.service.ts
│       │   └── s3.service.ts
│       ├── routes/            # REST API modules
│       └── scripts/seed.ts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/client.ts
        ├── store/             # Redux Toolkit
        ├── components/ui/     # shadcn-style
        ├── components/layout/
        ├── pages/             # Feature screens
        └── routes/AppRoutes.tsx
```
