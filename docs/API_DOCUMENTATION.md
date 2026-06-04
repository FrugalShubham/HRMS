# REST API Documentation

Base URL: `https://api.hrflow.ai/api/v1`  
Local: `http://localhost:5000/api/v1`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email + password → access + refresh tokens |
| POST | `/auth/refresh` | Refresh token rotation |
| POST | `/auth/logout` | Invalidate refresh |
| GET | `/auth/me` | Current user profile |

### Headers
```
Authorization: Bearer <accessToken>
X-Tenant-Id: <companyId>  // Enterprise API only
```

## Super Admin

| Method | Endpoint |
|--------|----------|
| GET/POST | `/platform/companies` |
| PATCH | `/platform/companies/:id/suspend` |
| PATCH | `/platform/companies/:id/activate` |
| DELETE | `/platform/companies/:id` |
| GET | `/platform/analytics` |
| CRUD | `/platform/plans` |
| GET/POST | `/platform/payments` |

## Company Admin

| Resource | Base Path |
|----------|-----------|
| Employees | `/employees` |
| Departments | `/departments` |
| Designations | `/designations` |
| Attendance | `/attendance` |
| Leave | `/leave` |
| Payroll | `/payroll` |
| Shifts | `/shifts` |
| Recruitment | `/recruitment` |
| Assets | `/assets` |
| Holidays | `/holidays` |
| Announcements | `/announcements` |

## Employee Self-Service

| Method | Endpoint |
|--------|----------|
| POST | `/attendance/check-in` |
| POST | `/attendance/check-out` |
| GET | `/attendance/my` |
| POST | `/leave/requests` |
| GET | `/payroll/payslips/:id/download` |

## Webhooks

| Method | Endpoint |
|--------|----------|
| POST | `/webhooks/whatsapp` |
| POST | `/webhooks/razorpay` |
| POST | `/webhooks/stripe` |

## AI

| Method | Endpoint |
|--------|----------|
| POST | `/ai/chat` |
| POST | `/ai/payroll-assist` |
| POST | `/ai/resume-screen` |
| GET | `/ai/attendance-insights` |

Full OpenAPI spec served at `/api/v1/docs` when server runs.
