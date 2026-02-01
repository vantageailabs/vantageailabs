# CLAUDE.md - Vantage AI Labs Project Guide

## Project Overview
Vantage AI Labs is a Business Operating System (BOS) for service businesses. It includes a lead funnel, automated booking, and AI readiness assessments.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Deployment:** Vercel / GitHub Pages
- **Key Patterns:** Client-side routing with `react-router-dom`, Supabase client in `src/integrations/supabase/client.ts`.

## Core Project Commands
- **Install:** `npm install`
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Supabase Local (Optional):** `supabase start`
- **Typecheck:** `npm run typecheck`

## Coding Standards & Patterns
- **Components:** Use functional components and hooks. Place reusable UI in `src/components/ui`.
- **Styling:** Use Tailwind CSS. Stick to the existing theme defined in `tailwind.config.ts`.
- **BOS Architecture:** The BOS is tiered. New features should be toggleable or modular to fit the drag-and-drop pricing model.
- **Form Handling:** Use the existing `useFormAnalytics` hook for any new lead capture forms to ensure tracking is consistent.
- **Admin Security:** Protect admin routes using the `ProtectedRoute` component and `useAdminRole` hook.

## GitHub Workflow
- **Branching:** Create feature branches (e.g., `feat/tiered-pricing`).
- **Commits:** Use conventional commits (e.g., `feat: add drag-and-drop pricing calculator`).
- **PRs:** When a task is done, run `/pr` to open a Pull Request for review.
