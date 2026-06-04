# HRFlow AI — MongoDB Schema Reference

All tenant-scoped collections include `companyId: ObjectId` (indexed) unless noted.

## Core Collections

### users
| Field | Type | Notes |
|-------|------|-------|
| email | String | unique, sparse for WhatsApp-only |
| passwordHash | String | bcrypt |
| role | Enum | super_admin, company_owner, company_admin, hr_manager, team_manager, employee |
| companyId | ObjectId | null for super_admin |
| employeeId | ObjectId | link to employees |
| isActive | Boolean | |
| refreshTokenVersion | Number | invalidate sessions |
| lastLoginAt | Date | |
| mfaEnabled | Boolean | |

### companies
| Field | Type | Notes |
|-------|------|-------|
| name, slug | String | slug unique |
| status | Enum | active, suspended, deleted |
| ownerId | ObjectId | |
| subscriptionId | ObjectId | |
| planId | ObjectId | |
| features | Object | feature flags from plan |
| settings | Object | attendance, geo, WhatsApp |
| aiCredits, whatsappCredits | Number | |
| officeLocation | GeoJSON Point | geo-fencing |

### employees
| Field | Type | Notes |
|-------|------|-------|
| employeeNumber | String | unique per company |
| userId | ObjectId | |
| departmentId, designationId | ObjectId | |
| managerId | ObjectId | |
| phone, whatsappNumber | String | |
| salaryStructure | Object | |
| joinDate, status | Date, Enum | |

### attendance
| Field | Type | Notes |
|-------|------|-------|
| employeeId | ObjectId | |
| date | Date | day bucket |
| checkIn, checkOut | Object | time, location, device, ip, selfieUrl |
| status | Enum | present, absent, late, half_day, wfh |
| source | Enum | web, mobile, whatsapp |

### leaveRequests
| Field | Type | Notes |
|-------|------|-------|
| leaveTypeId | ObjectId | |
| startDate, endDate | Date | |
| status | Enum | pending, manager_approved, hr_approved, approved, rejected |
| approvalChain | Array | approver, status, timestamp |

### subscriptions / plans / payments / invoices / auditLogs

See model files in `backend/src/models/` for full Mongoose schemas.

## Indexes Strategy

- Compound: `{ companyId: 1, employeeId: 1, date: -1 }` on attendance
- Compound: `{ companyId: 1, status: 1 }` on leaveRequests
- Text: candidates.resumeText for AI screening
- TTL: optional on auditLogs (90 days hot, archive to S3)
