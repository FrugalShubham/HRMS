# Frontend Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 6 |
| UI | React 18 + TypeScript |
| Styling | Tailwind + shadcn-style primitives |
| State | Redux Toolkit (auth, theme, UI) |
| Server state | TanStack React Query |
| Forms | React Hook Form + Zod |
| Motion | Framer Motion |
| Charts | Recharts |

## Folder Structure

```
frontend/src/
├── api/           # Axios client + interceptors
├── components/
│   ├── ui/        # Button, Card, Input (shadcn pattern)
│   ├── layout/    # Sidebar, Header, DashboardLayout
│   └── shared/    # StatCard, PageHeader
├── hooks/         # Typed Redux hooks
├── pages/         # Feature pages by domain
├── routes/        # React Router v7
├── store/         # Redux slices
├── types/         # Shared TS interfaces
└── lib/           # cn(), formatters
```

## Theme

- CSS variables in `index.css` for light/dark
- `themeSlice` persists preference to localStorage
- `document.documentElement.classList` toggles `.dark`

## Role-Based Navigation

`Sidebar.tsx` filters `navItems` by `user.role` — no route guard duplication needed for menu; add `ProtectedRoute` per role for sensitive routes in production.
