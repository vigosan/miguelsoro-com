# IMPLEMENTATION_PLAN.md

## Project Overview
Transform the static Miguel Soro art gallery into a dynamic e-commerce platform with admin capabilities, database integration, Stripe payments, and enhanced SEO.

## Stage 1: Database Setup & Migration
**Goal**: Migrate from static data to PostgreSQL database (Docker for dev, Vercel for prod)
**Status**: [X] Completed

### Tasks
- [X] Set up Docker PostgreSQL for development
- [X] Create Makefile for database management
- [X] Design database schema for pictures, orders, and admin users
- [X] Create database migrations and seed scripts
- [X] Install and configure Prisma ORM
- [ ] Implement database repository replacing in-memory implementation
- [ ] Migrate existing picture data to database (via seed)
- [ ] Set up image upload to Vercel Blob Storage
- [ ] Create image migration script for existing pictures

## Stage 2: Admin Panel Foundation
**Goal**: Create secure admin interface for picture management
**Status**: [ ] Not Started

### Tasks
- [ ] Implement authentication system (NextAuth.js)
- [ ] Create admin user seeding
- [ ] Build admin layout and navigation
- [ ] Create protected admin routes
- [ ] Implement picture CRUD operations (Create, Read, Update, Delete)
- [ ] Build image upload interface with drag & drop
- [ ] Add picture availability status (available/sold)
- [ ] Create admin dashboard with analytics

## Stage 3: E-commerce Integration
**Goal**: Enable picture sales with Stripe integration
**Status**: [ ] Not Started

### Tasks
- [ ] Install and configure Stripe
- [ ] Create Stripe product sync system
- [ ] Build shopping cart functionality
- [ ] Implement checkout process
- [ ] Add order management system
- [ ] Create customer notification emails
- [ ] Build order history for customers
- [ ] Add inventory management (mark as sold)
- [ ] Implement payment confirmation webhooks

## Stage 4: Enhanced User Experience
**Goal**: Improve social sharing, SEO, and user interface
**Status**: [ ] Not Started

### Tasks
- [ ] Fix social media sharing links (Twitter, Facebook, WhatsApp)
- [ ] Add Open Graph meta tags for picture pages
- [ ] Implement structured data (JSON-LD) for SEO
- [ ] Create XML sitemap generation
- [ ] Add breadcrumb navigation
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
  stripe_payment_intent_id VARCHAR,
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

### New Dependencies
```json
{
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "next-auth": "^4.24.0",
  "@next-auth/prisma-adapter": "^1.0.0",
  "stripe": "^14.0.0",
  "@vercel/blob": "^0.15.0",
  "bcryptjs": "^2.4.3",
  "nodemailer": "^6.9.0",
  "react-hook-form": "^7.47.0",
  "react-dropzone": "^14.2.0",
  "sharp": "^0.32.0",
  "@headlessui/react": "^1.7.19", // already installed
  "react-hot-toast": "^2.4.0"
}
```

### New File Structure
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
│   │   └── orders/
│   │       └── index.tsx      # Order management
│   ├── api/
│   │   ├── auth/[...nextauth].ts
│   │   ├── admin/
│   │   │   ├── pictures.ts
│   │   │   └── orders.ts
│   │   ├── stripe/
│   │   │   ├── checkout.ts
│   │   │   └── webhook.ts
│   │   └── upload/
│   │       └── image.ts
│   ├── cart.tsx               # Shopping cart page
│   ├── checkout.tsx           # Checkout page
│   └── order-confirmation.tsx # Order success page
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── stripe.ts             # Stripe configuration
│   ├── auth.ts               # NextAuth configuration
│   └── email.ts              # Email utilities
├── components/
│   ├── admin/                # Admin-specific components
│   ├── cart/                 # Cart components
│   └── seo/                  # SEO components
└── middleware.ts             # Route protection
```

### Key Implementation Notes

1. **Database Migration Strategy**:
   - Create migration script to transfer existing static data
   - Implement dual-read system during transition
   - Upload existing images to Vercel Blob Storage

2. **Authentication**:
   - Use NextAuth.js with database adapter
   - Secure admin routes with middleware
   - Implement role-based access control

3. **Stripe Integration**:
   - Sync pictures as Stripe products
   - Handle webhook events for payment confirmation
   - Implement automatic inventory updates

4. **SEO Enhancements**:
   - Dynamic meta tags per picture
   - Structured data for better search visibility
   - Social media preview optimization

5. **Image Management**:
   - Move from static files to Vercel Blob Storage
   - Implement automatic image optimization
   - Add multiple image support per picture

---

## Current Focus
Starting with **Stage 1: Database Setup & Migration** to establish the foundation for dynamic data management.