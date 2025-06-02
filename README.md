# Spray Management System

A comprehensive Next.js 14 application for managing spray operations with clean architecture, built with TypeScript, Prisma, and shadcn/ui.

## 🏗️ Architecture

This application follows Clean/Hexagonal Architecture principles with the following layers:

- **`/domain`** → Entities and business logic ports
- **`/application`** → Use cases and business rules  
- **`/infrastructure`** → Prisma, external services, data access
- **`/ui`** → Next.js App Router pages, layouts, components
- **`/store`** → Redux Toolkit slices for state management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Facebook Blue theme (#1877F2)
- **UI Components**: shadcn/ui (pre-configured)
- **State Management**: Redux Toolkit
- **Database**: Prisma ORM with Neon Postgres
- **Authentication**: NextAuth.js with RBAC
- **Charts**: Recharts
- **Excel Export**: SheetJS (xlsx)
- **Forms**: React Hook Form with Zod validation

## 📊 Database Schema

The application manages:

- **Actor Types & Actors** (Sprayers, Brigade Chiefs)
- **Geographic Hierarchy** (Provinces → Districts → Localities → Communities)
- **Spray Configurations** (Yearly spray plans)
- **Spray Totals** (Daily spray records with validation)
- **Targets** (Province and District level targets)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Neon Postgres database

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Neon database URL:
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

3. **Setup database:**
   ```bash
   # Push schema to database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed with demo data
   npx prisma db seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
spray-management/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Authentication routes
│   ├── dashboard/           # Dashboard pages
│   ├── globals.css          # Global styles with shadcn/ui theme
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   └── ui/                  # shadcn/ui components
├── domain/                  # Business entities and interfaces
│   ├── entities/
│   ├── repositories/
│   └── value-objects/
├── application/             # Use cases and business logic
│   ├── use-cases/
│   ├── dtos/
│   └── ports/
├── infrastructure/          # External concerns
│   ├── repositories/
│   ├── services/
│   └── prisma/
├── store/                   # Redux Toolkit store
│   ├── slices/
│   └── provider.tsx
├── lib/                     # Utilities and configurations
└── prisma/                  # Database schema and migrations
```

## 🎯 Features

### Completed ✅
- Next.js 14 with TypeScript and App Router
- Tailwind CSS with Facebook Blue theme
- shadcn/ui component system
- Redux Toolkit state management
- Prisma ORM with complete schema
- Clean architecture folder structure
- All required dependencies installed

### To Be Implemented 🚧
- NextAuth authentication with RBAC (Admin, Supervisor, Sprayer)
- Dashboard with progress metrics and charts
- CRUD interfaces for all entities
- Daily spray totals registration with validation
- Reports with Excel export functionality
- Audit trails and soft delete functionality
- Mobile-responsive design
- Jest testing setup
- Docker configuration
- CI/CD pipeline

## 🎨 Theme Configuration

The application uses Facebook Blue (#1877F2) as the primary brand color with full color palette:

```css
primary: {
  50: "#EBF3FE",
  100: "#D6E7FD", 
  500: "#1877F2", // Main Facebook Blue
  900: "#0A2E66"
}
```

## 🔐 Authentication Roles

- **Admin**: Full system access
- **Supervisor**: Manage spray operations and view reports  
- **Sprayer**: Record daily spray totals

## 📊 Dashboard Metrics

- **Spray Progress**: % of completed vs configured spray days
- **Coverage**: Structures sprayed ÷ structures found
- **Performance**: Structures/hour per brigade

## 🧪 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
npx prisma studio          # Open Prisma Studio
npx prisma db push         # Push schema changes
npx prisma generate        # Generate client
npx prisma db seed         # Seed database

# Code Quality  
pnpm lint                  # Run ESLint
pnpm type-check           # Run TypeScript checks
```

## 🐳 Docker Support (Planned)

Docker configuration will include:
- Multi-stage Node.js build
- Neon Postgres local fallback
- Development and production environments

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Redux Toolkit](https://redux-toolkit.js.org)

## 📄 License

This project is proprietary software for spray management operations.
# spray-management
