# Abdeldjalil Portfolio

Personal portfolio application for Abdeldjalil — a production-oriented React application with a
private Admin CMS backed by Firebase.

Development follows `AGENTS.md`, the authoritative project plan and agent contract.

## Current status

**Phase 01 — Foundation, repository baseline & Firebase bootstrap.**

The repository currently contains the technical foundation only. The public website, the Admin
CMS, Firebase services, and the design system are implemented in later phases.

## Technical foundation

- React 19 + TypeScript (strict mode) + Vite
- ESLint with the flat configuration
- Firebase Web SDK — client application initialization only, no Firebase service is enabled yet
- Environment-driven Firebase configuration (`VITE_FIREBASE_*`)

Tailwind CSS, routing, authentication, Firestore, Storage, Cloud Functions, and the CMS are
intentionally not part of Phase 01.

## Requirements

- Node.js 24+ (developed against Node.js 24)
- npm 11+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file from the template:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the Firebase Web App values
   (Firebase console → Project settings → Your apps → Web app → SDK setup and configuration).

`.env.local` is gitignored and must never be committed.

## Commands

| Command           | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite development server              |
| `npm run build`   | Type-check (`tsc -b`) and build for production |
| `npm run lint`    | Run ESLint                                     |
| `npm run preview` | Preview the production build locally           |