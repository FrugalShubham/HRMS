# Dashboard Wireframes (Text)

## Super Admin — Platform Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ [HRFlow AI]  Platform | Plans | Payments    [🌙] [Logout]   │
├──────────┬───────────────────────────────────────────────────┤
│ Sidebar  │  Platform Admin                                   │
│          │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│ Platform │  │Companies│ │Employees│ │ Revenue │ │ Active │    │
│ Plans    │  │  1,240  │ │ 89,400 │ │ ₹12.4M │ │  8,420 │    │
│ Payments │  └────────┘ └────────┘ └────────┘ └────────┘    │
│          │  ┌─────────────────────────────────────────────┐  │
│          │  │ Companies Table [Create] [Suspend]          │  │
│          │  └─────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────┘
```

## Company Admin — HR Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Welcome, Priya          [Check In] [🌙] [Logout]             │
├──────────┬───────────────────────────────────────────────────┤
│ Dashboard│  ┌ Employees ┐ ┌ Present ┐ ┌ On Leave ┐ ┌ Rate ┐ │
│ Employees│  └───────────┘ └─────────┘ └──────────┘ └──────┘ │
│ Attendance│ ┌──────────── Weekly Attendance Chart ─────────┐ │
│ Leave    │  └──────────────────────────────────────────────┘ │
│ Payroll  │                                                   │
│ AI       │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

## Employee — Self Service (Mobile)

```
┌─────────────────────┐
│ HRFlow AI      [≡]  │
├─────────────────────┤
│  Good morning, Raj  │
│  [  CHECK IN  ]     │  ← GPS + optional selfie
│  [ CHECK OUT ]      │
├─────────────────────┤
│ Leave balance: 8 CL │
│ Next holiday: Aug 15│
│ WhatsApp: CHECKIN   │
└─────────────────────┘
```

Implemented in `frontend/src/pages/` with responsive Tailwind layouts.
