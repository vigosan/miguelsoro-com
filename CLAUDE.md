# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miguel Soro Art Website — a production e-commerce site (Next.js 14, Pages Router) selling cycling-inspired artwork. Public gallery + cart/checkout paid through PayPal, plus a full admin panel (pictures, orders, news, product types, settings) behind JWT cookie auth. Data lives in Supabase Postgres. **Real money flows through this code**: never break existing checkout/order behavior.

## Commands

```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build (also type-checks pages)
npm run lint          # ESLint
npm run format        # Prettier (with Tailwind plugin)
npm test              # Vitest (single run); npm run test:watch for watch mode
npx tsc --noEmit      # Full type-check including tests (kept at 0 errors)
make setup / make up  # Docker Postgres for local development
```

## Architecture

```
domain/        # Entities + pure business logic (Picture, Order, News)
application/   # Use cases (orderUseCases.ts: CreateOrder, CapturePayPalOrder, webhooks)
infra/         # Repository interfaces + Supabase implementations
services/      # DB-backed settings (general/shipping) with a 60s in-memory cache
lib/           # auth (JWT), paypal client, email (Resend), invoice PDF (pdf-lib)
hooks/         # TanStack Query hooks (usePictures, useOrders, useAdminSettings, ...)
contexts/      # CartContext (localStorage-persisted cart)
pages/         # Pages Router; pages/api/** for API routes; pages/admin/** for the panel
supabase/migrations/  # SQL migrations — applied to prod MANUALLY, BEFORE deploying code
```

## Critical invariants

- **Price units**: the DB stores cents. `Picture.price` is **euros** (repositories convert). Order/variant amounts (`subtotal`, `tax`, `total`, `variant.price`) are **cents**. `formatPrice` takes cents, `formatEuros` takes euros. Check which you have before doing math.
- **Server is the price/stock authority**: checkout sends only `{variantId, quantity}`; `/api/paypal/create-order` recomputes prices from the DB, validates quantity vs stock, and loads shipping settings itself. Never trust client amounts.
- **Payment concurrency**: `markPaidByPayPalId` derives `alreadyPaid` from the guarded UPDATE's affected rows (capture endpoint and webhook race); stock updates use compare-and-swap with retry. Webhook status transitions are guarded (`fromStatuses`) so late events can't downgrade PAID orders. Don't "simplify" these.
- **Order references**: customers see `orderNumber` (`MS-XXXXXX`, via `orderReference()` in domain/order.ts); the UUID stays internal and acts as the unguessable token for `/api/orders/[orderId]` and the confirmation page URL.
- **Free shipping threshold 0 means disabled** (rate always charged), per the admin UI copy.
- **Migrations before code**: deploying code that references a column before its migration runs breaks prod (it happened). Apply `supabase/migrations/*.sql` in the Supabase dashboard first.

## Conventions

- Pages Router (not App Router). Public pages use ISR (`getStaticProps` + `revalidate: 3600`); admin picture create/update/delete revalidate `/`, `/obra`, and detail pages.
- Admin data fetching goes through TanStack Query hooks in `hooks/` (query keys + mutations that invalidate). `usePictures.ts` is the reference pattern. No manual `useState`+`useEffect` fetch triads.
- All `/api/admin/**` routes are wrapped in `requireAuth` (lib/auth.ts). `/api/news` mutations and the `?all=true` draft listing also require auth.
- Admin UI: shared primitives in `components/ui/` (Input, Select, ConfirmDialog...), `PageHeader`, one `Toaster` mounted in `AdminLayout`, order status labels/colors from `orderStatusMeta()` in domain/order.ts.
- Settings reads (`getGeneralSettings`/`getShippingSettings`) are cached ~60s via `services/settingsCache.ts`; writers invalidate. Fiscal data feeds invoices — the settings forms must not render editable defaults before data loads.
- Testing: Vitest + Testing Library, TDD (red first). API tests mock `@/infra/dependencies` and use helpers from `__tests__/api/simple-helpers.ts` (`createAuthedRequest` for protected routes). Tests must encode WHY (e.g. "unique artwork cannot oversell").
- Images: blob storage (Vercel Blob) with `/pictures/*.webp` as legacy fallback; always set `sizes` on `fill` images.

## Gotchas

- `next build` type-checks everything; run it before committing API/type changes — vitest alone won't catch type errors.
- jsdom tests: Node ≥22 ships a disabled `localStorage` global; `test/setup.ts` polyfills it (plus matchMedia, observers).
- PayPal webhook signature verification (`lib/paypalWebhook.ts`) is correct — never weaken it.
- The cart stores prices in euros; `/api/cart/validate` variants return cents (divide by 100 when comparing).
