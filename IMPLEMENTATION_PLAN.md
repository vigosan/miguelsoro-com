# IMPLEMENTATION_PLAN.md

## Project Overview
Transform the static Miguel Soro art gallery into a dynamic e-commerce platform with admin capabilities, database integration, PayPal payments, and enhanced SEO.

## Stage 1: Database Setup & Migration
**Goal**: Migrate from static data to PostgreSQL database (Supabase for prod)
**Status**: [X] Completed

### Tasks
- [X] Set up PostgreSQL for development and production (Supabase)
- [X] Create Makefile for database management
- [X] Design database schema for pictures, orders, and admin users
- [X] Create database migrations and seed scripts
- [X] Install and configure Prisma ORM
- [X] Implement database repository replacing in-memory implementation
- [X] Migrate existing picture data to database (via seed)
- [X] Set up image upload to Vercel Blob Storage
- [X] Create image migration script for existing pictures

## Stage 2: Admin Panel Foundation
**Goal**: Create secure admin interface for picture management
**Status**: [X] Completed

### Tasks
- [X] Implement authentication system (NextAuth.js)
- [X] Create admin user seeding
- [X] Build admin layout and navigation
- [X] Create protected admin routes
- [X] Implement picture CRUD operations (Create, Read, Update, Delete)
- [X] Build image upload interface with drag & drop
- [X] Add picture availability status (available/sold/reserved)
- [X] Create admin dashboard with analytics
- [X] Implement React Query for efficient data caching
- [X] Create modern UI components with Tailwind CSS
- [X] Add responsive design for mobile admin interface
- [X] Implement route-based settings navigation

## Stage 2.1: Technical Debt & Code Quality (CRITICAL)
**Goal**: Fix critical architecture issues and establish proper testing infrastructure
**Status**: [X] COMPLETED ✅

### Critical Issues Found in Code Review
- [🔥] **Type System Inconsistencies**: Multiple conflicting Picture types across codebase
- [🔥] **Database-Code Mismatch**: Repository references non-existent tables
- [🔥] **Missing Testing Infrastructure**: Zero test coverage, no testing framework
- [🔥] **Incomplete React Query Migration**: Mixed data fetching patterns
- [🔥] **API Design Issues**: Inconsistent error handling and response formats

### Tasks COMPLETED ✅
- [X] **Fix Type System** (CRITICAL):
  - [X] Consolidate all Picture types into single domain source ✅
  - [X] Remove conflicting type definitions in hooks/usePictures.ts ✅
  - [X] Create proper type exports and barrel files (following CLAUDE.md) ✅
  - [X] Update all imports to use domain types ✅
  
- [X] **Implement Testing Infrastructure** (CRITICAL):
  - [X] Install and configure Vitest (per CLAUDE.md requirements) ✅
  - [X] Add React Testing Library and @testing-library/jest-dom ✅
  - [X] Create renderWithProviders() test utility with QueryClient ✅
  - [X] Add data-testid attributes to all interactive elements ✅
  - [X] Hybrid React plugin configuration with dynamic import ✅
  - [X] All existing tests passing (5/5) ✅
  
- [X] **Fix Database Layer** (HIGH PRIORITY):
  - [X] Resolve DatabasePictureRepository schema mismatch ✅
  - [X] Standardize on Product→Picture mapping or separate entities ✅
  - [X] Fix API endpoints to use correct database queries ✅
  - [X] Add proper error handling with contextual messages ✅
  
- [X] **Complete React Query Migration**:
  - [X] Update deprecated cacheTime to gcTime for v5 compatibility ✅
  - [X] Migrate server data fetching from useState/useEffect to React Query ✅
  - [X] Keep useState for local UI state (filters, modals, forms) - correct pattern ✅
  - [X] Add optimistic updates for better UX ✅
  - [X] Implement proper query invalidation strategies ✅
  
- [X] **Accessibility & Performance**:
  - [X] Add data-testid attributes throughout (CLAUDE.md requirement) ✅
  - [X] Implement proper ARIA labels and keyboard navigation ✅
  - [X] Add image optimization for admin interface ✅
  - [X] Fix unnecessary re-renders with useCallback/useMemo ✅
  
- [X] **Code Quality Improvements**:
  - [X] Complete Tailwind configuration ✅
  - [X] ESLint and Prettier working properly ✅
  - [X] Implement proper dependency injection in API routes ✅
  - [X] Add comprehensive TypeScript strict mode compliance ✅

### Remaining Advanced Tasks (Optional for Stage 3):
- [ ] Create standard error response format
- [ ] Add request validation with Zod schemas  
- [ ] Add API endpoint testing
- [ ] Write tests for critical admin components

## Stage 3: E-commerce Integration
**Goal**: Enable picture sales with PayPal integration
**Status**: [X] Completed ✅

### Tasks
- [X] Install and configure PayPal SDK ✅
- [X] Create PayPal product sync system ✅
- [X] Build shopping cart functionality ✅
- [X] Implement checkout process with PayPal ✅
- [X] Add order management system ✅
- [X] Create customer notification emails ✅
- [X] Build order confirmation page ✅
- [X] Add inventory management (mark as sold) ✅
- [X] Implement PayPal webhook handlers for payment confirmation ✅

## Stage 4: Enhanced User Experience
**Goal**: Improve social sharing, SEO, and user interface
**Status**: [X] SEO & Social Sharing Completed ✅

### Tasks
- [X] Fix social media sharing links (Twitter, Facebook, WhatsApp) ✅ COMPLETED
- [X] Add Open Graph meta tags for picture pages ✅ COMPLETED
- [X] Implement structured data (JSON-LD) for SEO ✅ COMPLETED
- [X] Create XML sitemap generation ✅ COMPLETED
- [X] Add breadcrumb navigation ✅ COMPLETED
- [X] Optimize robots.txt for search engines ✅ COMPLETED
- [X] Add comprehensive image alt tags with SEO keywords ✅ COMPLETED
- [X] Implement schema markup for artwork, person, and business data ✅ COMPLETED
- [ ] Implement picture search and filtering
- [ ] Add wishlist/favorites functionality
- [ ] Create contact form with email integration
- [ ] Add newsletter subscription

## Stage 5: Performance & Advanced Features
**Goal**: Optimize performance and add advanced e-commerce features
**Status**: [ ] Not Started

### Tasks
- [ ] Implement image optimization pipeline
- [ ] Add progressive image loading
- [ ] Create picture zoom/gallery viewer
- [ ] Add related pictures recommendations
- [ ] Implement price history tracking
- [ ] Add customer reviews/testimonials
- [ ] Create advanced admin analytics
- [ ] Add automated social media posting
- [ ] Implement multi-language support (ES/EN)
- [ ] Add print shipping calculator

---

## Technical Architecture Changes

### Database Schema
```sql
-- Pictures table
CREATE TABLE pictures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  size VARCHAR,
  slug VARCHAR UNIQUE NOT NULL,
  image_url VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'available', -- available, sold, reserved
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picture_id UUID REFERENCES pictures(id),
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  paypal_order_id VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, paid, shipped, delivered
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Dependencies by Stage

#### Stage 1 & 2 (Completed)
```json
{
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0", 
  "next-auth": "^4.24.0",
  "@next-auth/prisma-adapter": "^1.0.0",
  "@vercel/blob": "^0.15.0",
  "bcryptjs": "^2.4.3",
  "react-hook-form": "^7.47.0",
  "react-dropzone": "^14.2.0",
  "sharp": "^0.32.0",
  "@headlessui/react": "^1.7.19",
  "react-hot-toast": "^2.4.0",
  "@tanstack/react-query": "^5.0.0",
  "@heroicons/react": "^2.0.0"
}
```

#### Stage 2.1 - Testing & Code Quality (CRITICAL)
```json
{
  "vitest": "^1.6.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.4.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^24.0.0",
  "zod": "^3.22.0",
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```

#### Stage 3 - E-commerce & PayPal
```json
{
  "@paypal/react-paypal-js": "^8.1.0",
  "@paypal/paypal-server-sdk": "^0.5.0",
  "nodemailer": "^6.9.0"
}
```

### Updated File Structure (Post Code Review)
```
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── pages/
│   ├── admin/
│   │   ├── index.tsx          # Admin dashboard
│   │   ├── pictures/
│   │   │   ├── index.tsx      # Pictures management
│   │   │   ├── new.tsx        # Add new picture
│   │   │   └── [id]/edit.tsx  # Edit picture
│   │   ├── orders/
│   │   │   └── index.tsx      # Order management
│   │   └── settings/
│   │       ├── index.tsx      # Settings redirect
│   │       ├── general.tsx    # General settings
│   │       ├── tienda.tsx     # Store settings
│   │       ├── pagos.tsx      # Payment settings
│   │       ├── inventario.tsx # Inventory settings
│   │       └── admin.tsx      # Admin settings
│   ├── api/
│   │   ├── auth/[...nextauth].ts
│   │   ├── admin/
│   │   │   ├── pictures/
│   │   │   │   ├── index.ts   # GET/POST pictures
│   │   │   │   └── [id].ts    # GET/PATCH/DELETE by ID
│   │   │   └── orders.ts
│   │   ├── paypal/
│   │   │   ├── create-order.ts
│   │   │   └── webhook.ts
│   │   └── upload/
│   │       └── image.ts
│   ├── cart.tsx               # Shopping cart page
│   ├── checkout.tsx           # Checkout page
│   └── order-confirmation.tsx # Order success page
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── paypal.ts             # PayPal configuration
│   ├── auth.ts               # NextAuth configuration
│   └── email.ts              # Email utilities
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Main admin layout
│   │   └── SettingsLayout.tsx # Settings layout
│   ├── ui/                   # Reusable UI components
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Toggle.tsx
│   │   └── Checkbox.tsx
│   ├── cart/                 # Cart components
│   └── seo/                  # SEO components
├── hooks/
│   ├── usePictures.ts        # Picture data fetching
│   ├── useOrders.ts          # Order data fetching
│   └── useProducts.ts        # Product data fetching
├── domain/                   # Domain types (CONSOLIDATE TYPES HERE)
│   ├── picture.ts            # Single source of truth for Picture type
│   ├── product.ts            # Product domain types
│   └── order.ts              # Order domain types
├── infra/                    # Infrastructure layer
│   ├── repositories/
│   │   ├── PictureRepository.ts
│   │   ├── DatabasePictureRepository.ts
│   │   ├── ProductRepository.ts
│   │   └── DatabaseProductRepository.ts
├── test/                     # Testing infrastructure (NEW)
│   ├── setup.ts              # Test setup and utilities
│   ├── renderWithProviders.tsx # Test utility wrapper
│   └── __mocks__/            # Mock implementations
├── __tests__/                # Test files (NEW)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── api/
├── middleware.ts             # Route protection
├── vitest.config.ts          # Vitest configuration (NEW)
├── .eslintrc.json           # ESLint configuration (NEW)
├── .prettierrc              # Prettier configuration (NEW)
└── tailwind.config.js       # Complete Tailwind config (FIX)
```

### Key Implementation Notes

#### 1. **Critical Issues Identified in Code Review**

**Type System Problems**:
- Multiple conflicting `Picture` types in `domain/picture.ts` vs `hooks/usePictures.ts`
- Breaking changes needed to consolidate all domain types
- Repository layer expects different schema than what exists

**Testing Infrastructure Gap**:
- Zero test coverage across entire codebase
- No testing framework or utilities configured
- Components not designed for testability (missing data-testid attributes)
- Critical violation of CLAUDE.md testing requirements

**Database-Code Misalignment**:
- `DatabasePictureRepository` references non-existent `pictures` table
- API endpoints mixing Product and Picture concepts incorrectly
- Incomplete repository implementation with placeholder errors

#### 2. **Architectural Decisions**

**Domain Layer Strategy**:
- Consolidate all types in `/domain` folder as single source of truth
- Implement proper dependency inversion with repository interfaces
- Use React Query as the primary data fetching pattern (eliminate useState/useEffect)

**Testing Strategy (Per CLAUDE.md)**:
- **Vitest** as test runner (not Jest) - modern, fast, native TypeScript
- **React Testing Library** for component testing
- **data-testid attributes** for element selection (never CSS classes)
- Custom `renderWithProviders()` utility with QueryClient and contexts

**Code Quality Standards**:
- TypeScript strict mode compliance
- ESLint + Prettier with Tailwind plugin
- Comprehensive error handling with Zod schemas
- Performance optimization with proper React patterns

#### 3. **Migration Priorities**

**CRITICAL (Must fix before Stage 3)**:
1. Fix type system inconsistencies - breaks compilation
2. Resolve database schema mismatches - breaks functionality  
3. Add testing infrastructure - required by CLAUDE.md
4. Complete React Query migration - performance and consistency

**Important (Should fix soon)**:
1. Add proper error handling and API validation
2. Implement accessibility features (data-testid, ARIA)
3. Complete Tailwind configuration
4. Add proper dependency injection

#### 4. **Previous Implementation Notes**

**Database Migration Strategy** ✅ COMPLETED:
- Migration scripts successfully transfer existing static data
- Dual-read system implemented during transition
- Images uploaded to Vercel Blob Storage

**Authentication** ✅ COMPLETED:
- NextAuth.js with database adapter configured
- Admin routes secured with middleware
- Role-based access control implemented

**PayPal Integration** 📋 PLANNED:
- Create PayPal orders for picture purchases
- Handle webhook events for payment confirmation
- Implement automatic inventory updates

**SEO Enhancements** 📋 PLANNED:
- Dynamic meta tags per picture
- Structured data for better search visibility
- Social media preview optimization

---

## Current Focus & Immediate Actions

### 🎯 **CURRENT PRIORITY: Database Migration to Supabase Client**
**Status**: In Progress - ProductTypes migrated successfully ✅

#### **Problem Solved**:
The project was experiencing frequent database connection issues with Supabase using Prisma:
- `GET /api/admin/product-types 500 in 5094ms`
- `Can't reach database server at aws-1-eu-west-2.pooler.supabase.com:5432`
- Frequent connection timeouts and instability

#### **Solution: Complete Migration to Supabase Client SSR**
Following the stable architecture pattern from adj-xativa project, which has never had connection issues.

### **Migration Strategy & Progress**:

#### **✅ COMPLETED - Phase 0: Infrastructure Setup**
- [X] Install @supabase/ssr and @supabase/supabase-js packages
- [X] Create Supabase client configuration for Pages Router
- [X] Implement SupabaseProductTypeRepository
- [X] Migrate ProductTypes endpoints - **STABLE & FAST** (86-154ms response times)
- [X] Clean up obsolete db-retry.ts and unused middleware

#### **🚀 NEXT: Phase 1 - Non-Critical Entities** (Days 1-3):
- [ ] **Pictures Repository** → Supabase Client
  - [ ] Create SupabasePictureRepository implementing PictureRepository
  - [ ] Migrate `/api/pictures/*` endpoints 
  - [ ] Update admin pictures CRUD operations
  
- [ ] **Products Repository** → Supabase Client  
  - [ ] Extend SupabaseProductRepository for full Product entity
  - [ ] Migrate `/api/products/*` endpoints
  - [ ] Test product catalog functionality

- [ ] **ShippingSettings** → Supabase Client
  - [ ] Create SupabaseShippingRepository
  - [ ] Migrate shipping configuration endpoints
  - [ ] Update shipping calculation logic

#### **🎯 Phase 2 - Critical Systems** (Days 4-7):
- [ ] **Orders Repository** → Supabase Client ⚠️ CRITICAL
  - [ ] Create SupabaseOrderRepository implementing OrderRepository
  - [ ] Migrate order management endpoints carefully
  - [ ] **Extensive testing** - orders handle payments & customer data
  
- [ ] **PayPal Integration** → Supabase Client ⚠️ CRITICAL  
  - [ ] Update PayPal webhook handlers to use Supabase
  - [ ] Migrate payment confirmation logic
  - [ ] Update order creation in create-order.ts
  - [ ] **Thorough testing** - handles real money transactions

#### **🧹 Phase 3 - Cleanup** (Days 8-10):
- [ ] **Remove Prisma Dependencies**
  - [ ] Remove @prisma/client and prisma packages
  - [ ] Delete lib/prisma.ts
  - [ ] Remove all DatabaseXXXRepository classes
  - [ ] Clean up Prisma schema and migrations
  - [ ] Update dependency injection in infra/dependencies.ts
  
- [ ] **Environment Cleanup**
  - [ ] Remove POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING
  - [ ] Simplify to only Supabase environment variables
  - [ ] Update Makefile to remove Prisma commands

#### **🔄 Architecture Comparison**:

**Before (Problematic)**:
```
Prisma Client → PostgreSQL Connection → Supabase
- Manual connection pooling
- Custom retry logic needed  
- Frequent timeouts
- 5094ms response times
```

**After (Stable)**:
```
Supabase Client SSR → Supabase Infrastructure
- Automatic connection management
- Built-in retry & resilience  
- Consistent performance
- 86-154ms response times
```

#### **Benefits of Complete Migration**:
- ✅ **Stability**: Same architecture as adj-xativa (zero connection issues)
- ✅ **Performance**: Consistent fast response times
- ✅ **Maintenance**: Single data access technology
- ✅ **Reliability**: Supabase handles connection pooling automatically
- ✅ **Simplicity**: Remove complex retry logic and timeout configurations

#### **Risk Mitigation**:
- **Phase 1**: Low risk (Pictures, Products, Shipping)
- **Phase 2**: High risk but high reward (Orders, Payments) - extensive testing required
- **Rollback plan**: Keep Prisma implementations until Supabase versions are fully tested

### **After Migration Completion**:
Continue with existing roadmap (Stage 5: Performance & Advanced Features) on a stable, single-technology foundation.

---

## Development Workflow Reminder
Following CLAUDE.md guidelines:
- **Tracer bullets**: Implement end-to-end minimal features first
- **Testing required**: Every component must have data-testid and tests
- **Single responsibility**: Break down complex components
- **Repository pattern**: Maintain dependency inversion principles