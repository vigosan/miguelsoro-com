# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miguel Soro Art Website - A Next.js-based art portfolio website showcasing cycling-inspired artwork. The site displays art pieces with images, descriptions, and pricing information across multiple pages including biography, news, contact, and individual artwork pages.

## Development Commands

```bash
# Development
npm run dev           # Start development server (localhost:3000)
npm run build         # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier + Tailwind plugin
```

## Technology Stack

- **Framework**: Next.js 14 with Pages Router (not App Router)
- **Styling**: Tailwind CSS v4 (alpha) with PostCSS
- **Font**: Geist Sans via `geist` package
- **Icons**: Heroicons + Headless UI React components
- **Analytics**: Vercel Analytics
- **Language**: TypeScript with strict mode

## Architecture

The codebase follows a clean architecture pattern with clear separation of concerns:

### Domain Layer
- `domain/picture.ts` - Core Picture entity with helper functions for paths
- Pure business logic with no external dependencies

### Application Layer  
- `application/` - Use cases like `findAllPictures` and `findPictureBySlug`
- Orchestrates domain objects and infrastructure

### Infrastructure Layer
- `infra/PictureRepository.ts` - Repository pattern with interface and in-memory implementation
- `data/pictures.ts` - Static data source for all artwork information

### Presentation Layer
- `pages/` - Next.js pages using Pages Router
- `components/` - Reusable UI components (Layout, Header, Footer, Item, List, Pagination)
- `hooks/` - Custom React hooks (usePictures, usePicture)

### Key Patterns

**Repository Pattern**: Used for data access with `PictureRepository` interface and `InMemoryPictureRepository` implementation. This enables easy testing and future database integration.

**Custom Hooks**: Data fetching logic abstracted into `usePictures()` and `usePicture(slug)` hooks that internally use the repository pattern.

**Component Composition**: 
- `Layout` component wraps all pages with consistent header/footer
- `Item` component handles individual artwork display with Next.js Image optimization
- `List` component manages grid display of artwork items

**Path Management**: Centralized path generation in `domain/picture.ts` with `getPath()` and `getImgPath()` functions.

## File Structure

```
├── pages/                 # Next.js pages (Pages Router)
│   ├── index.tsx         # Homepage with artwork grid
│   ├── pictures/[slug].tsx # Dynamic artwork detail pages
│   ├── biography.tsx     # Artist biography
│   ├── news.tsx         # News/exhibitions
│   └── contact.tsx      # Contact information
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks for data fetching
├── application/         # Use cases and business logic
├── domain/             # Core entities and business rules
├── infra/              # Infrastructure (repositories, data access)
├── data/               # Static data (artwork information)
└── utils/              # Utility functions (slug, cn, formatCurrency)
```

## Data Flow

1. Static artwork data in `data/pictures.ts`
2. `InMemoryPictureRepository` provides data access
3. Application services (`findAllPictures`, `findPictureBySlug`) orchestrate operations
4. Custom hooks (`usePictures`, `usePicture`) manage React state
5. Components consume data through hooks
6. Images served from `/public/pictures/` directory

## Key Configuration

- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to `./`)
- **Tailwind**: v4 alpha with custom PostCSS configuration
- **Next.js**: Transpiles `geist` package, uses Pages Router
- **Image Optimization**: All artwork images are `.webp` format for performance

## Development Notes

- Uses Pages Router (not App Router) - maintain this pattern
- All artwork images should be placed in `/public/pictures/` as `.webp` files
- Artwork data is statically defined - no external API calls
- Repository pattern enables easy transition to database if needed
- Component styling uses Tailwind classes with `cn()` utility for conditional classes
- Typography follows consistent hierarchy with Geist Sans font