# MyBank - Financial Platform

## Overview
MyBank is a frontend banking/financial platform application. It features a landing page, authentication, dashboard, fund transfers, transaction logs, admin panel, and settings.

## Recent Changes
- **2026-02-13**: Imported from Lovable to Replit. Updated Vite config to run on port 5000 with all hosts allowed. Removed lovable-tagger plugin. Updated branding to MyBank.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite 5
- **Routing**: react-router-dom v6
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query v5
- **Forms**: react-hook-form + zod
- **Charts**: Recharts

## Project Architecture
- `src/` - Main source directory
  - `App.tsx` - Root component with routing and layout
  - `main.tsx` - Entry point
  - `pages/` - Page components (LandingPage, AuthPage, DashboardPage, TransferPage, LogsPage, AdminPage, SettingsPage, NotFound)
  - `components/` - Reusable components including AppSidebar, NavLink, ProfileAvatar
  - `components/ui/` - shadcn/ui primitives
  - `hooks/` - Custom hooks (use-auth, etc.)
  - `lib/` - Utility functions
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration (port 5000, all hosts allowed)
- `tailwind.config.ts` - Tailwind configuration

## User Preferences
- None recorded yet

## Notes
- This is currently a frontend-only application (no backend server)
- Authentication is handled client-side via a custom useAuth hook
- The app uses react-router-dom (not wouter) for routing
