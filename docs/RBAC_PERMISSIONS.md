# RBAC Permissions Matrix

| Permission | Super Admin | Owner | Admin | HR Mgr | Team Mgr | Employee |
|------------|:-----------:|:-----:|:-----:|:------:|:--------:|:--------:|
| platform.companies.create | ✓ | | | | | |
| platform.companies.suspend | ✓ | | | | | |
| platform.analytics | ✓ | | | | | |
| platform.plans.manage | ✓ | | | | | |
| platform.credits.manage | ✓ | | | | | |
| company.settings | ✓ | ✓ | ✓ | | | |
| employees.create | | ✓ | ✓ | ✓ | | |
| employees.read | | ✓ | ✓ | ✓ | ✓* | ✓* |
| employees.delete | | ✓ | ✓ | | | |
| departments.manage | | ✓ | ✓ | ✓ | | |
| attendance.read.all | | ✓ | ✓ | ✓ | ✓* | |
| attendance.mark.self | | ✓ | ✓ | ✓ | ✓ | ✓ |
| leave.approve.manager | | | ✓ | ✓ | ✓ | |
| leave.approve.hr | | | ✓ | ✓ | | |
| leave.request | | ✓ | ✓ | ✓ | ✓ | ✓ |
| payroll.manage | | ✓ | ✓ | ✓ | | |
| payroll.view.self | | ✓ | ✓ | ✓ | | ✓ |
| recruitment.manage | | ✓ | ✓ | ✓ | | |
| assets.manage | | ✓ | ✓ | ✓ | | |
| announcements.manage | | ✓ | ✓ | ✓ | | |
| ai.use | | ✓† | ✓† | ✓† | | |
| reports.export | | ✓ | ✓ | ✓ | ✓* | |

\* Team scope: direct reports only  
† Requires `features.aiAssistant` on plan

## Implementation

- Permissions stored in `backend/src/config/permissions.ts`
- `authorize('employees.create')` middleware checks role → permission map
- Custom roles (Enterprise): extend via `roles` collection
