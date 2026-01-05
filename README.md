# Goal Setter App

A hierarchical goal-setting application that helps users break down yearly goals into monthly, weekly, and daily actionable tasks with AI-powered suggestions.

## 🎯 Project Overview

**Vision**: Enable users to set and achieve their goals through systematic breakdown and progress tracking.

**Key Features**:
- **Hierarchical Goal Management**: Yearly → Monthly → Weekly → Daily
- **Hybrid Progress Tracking**: Checkbox completion + numeric tracking (e.g., "Run 3 miles" with 2/3 progress)
- **AI-Powered Suggestions**: Claude Haiku for free tier guided prompts
- **Progress Rollup**: Daily completion aggregates to weekly/monthly/yearly progress
- **Smart Notifications**: Weekly summary popups showing contribution to larger goals
- **Freemium Model**:
  - Free: Guided prompts and templates
  - Paid: Full LLM-powered goal planning with user's own API keys

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling with neutral color palette)
- Zustand (state management)
- React Hook Form + Zod (form handling & validation)
- date-fns (date manipulation)

**Backend/Database**:
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security for multi-user support
- Anonymous auth for single-user mode

**AI Integration**:
- Claude Haiku (app-owned key for free tier suggestions)
- Support for OpenAI, Anthropic, Google APIs (user-provided keys for paid tier)

### Project Structure

```
goal-setter-app/
├── database/
│   ├── schema.sql              # Complete database schema
│   └── README.md               # Setup instructions
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── goals/          # Goal-specific components
│   │   │   ├── dashboard/      # Dashboard views
│   │   │   ├── layout/         # Layout components (Header, SidePanel, Layout)
│   │   │   └── ui/             # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/
│   │   │   ├── supabase.ts     # Supabase client config
│   │   │   ├── llm.ts          # LLM integration (Claude Haiku)
│   │   │   └── database.types.ts
│   │   ├── pages/              # Page components
│   │   ├── store/
│   │   │   ├── goalStore.ts    # Goal state management
│   │   │   ├── notificationStore.ts
│   │   │   ├── settingsStore.ts
│   │   │   └── toastStore.ts
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript definitions
│   │   ├── utils/
│   │   │   └── index.ts        # Utility functions
│   │   └── App.tsx
│   ├── .env.example            # Environment variables template
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## ✅ Progress Report (Phase 1: Foundation Complete)

### Completed Components

#### 1. **Project Configuration** ✅
- Vite + React + TypeScript setup
- TailwindCSS with neutral color palette (grays, blues)
- Professional folder structure
- Environment variable configuration

#### 2. **TypeScript Foundation** ✅
- Comprehensive type definitions for all entities
- Enums for goal types, tracking types, difficulty levels
- Database model interfaces
- Form input types
- LLM integration types

#### 3. **Database Schema** ✅
**Tables**:
- `users`: User accounts and subscription info
- `goals`: All goal types with hybrid tracking
- `progress_logs`: Historical progress tracking
- `notifications`: In-app notifications
- `user_api_keys`: Encrypted API key storage

**Features**:
- Row Level Security (RLS) policies
- Cascading deletes for goal hierarchies
- Auto-update timestamps
- Progress calculation function
- Performance indexes

#### 4. **UI Component Library** ✅
Production-ready components:
- `Button`: Multiple variants (primary, secondary, outline, ghost, danger)
- `Input`, `Textarea`, `Select`: Form inputs with labels, errors, validation
- `Checkbox`: For task completion
- `Card`: Content containers with header/footer
- `Modal`: Accessible dialogs with ESC key support
- `Badge`: Status indicators
- `ProgressBar`: Visual progress with color coding
- `Toast`: Notification system with animations

#### 5. **Layout Components** ✅
- **Header**: Logo, notifications bell, settings
- **SidePanel**: Collapsible goal overview (yearly/monthly/weekly)
  - Expandable sections
  - Goal cards with progress bars
  - Badge indicators for goal counts
- **Layout**: Main wrapper coordinating header + content + sidepanel

#### 6. **State Management (Zustand)** ✅
- **goalStore**:
  - CRUD operations for goals
  - Supabase integration with local storage fallback
  - Progress calculation logic
  - Hierarchical goal selectors
- **notificationStore**:
  - Notification management
  - Weekly summary creation
  - Unread count tracking
- **settingsStore**:
  - Subscription tier management
  - API key storage (encrypted in Supabase)
  - User preferences (persisted)
- **toastStore**:
  - In-app toast notifications
  - Auto-dismiss functionality

#### 7. **Utility Functions** ✅
- Date formatting and manipulation
- Progress percentage calculations
- Color coding for progress states
- Goal hierarchy tree building
- Local storage helpers
- Debounce, truncate, CSV parsing
- `cn()` for Tailwind class merging

#### 8. **LLM Integration Layer** ✅
- Claude Haiku API client
- Prompt template system
- Mock suggestions fallback
- Goal breakdown prompt builder
- Structured response parsing

## 🔐 Environment Setup

### Required API Keys

You'll need to provide:

1. **Supabase** (create at [supabase.com](https://supabase.com)):
   - Project URL
   - Anon/Public Key

2. **Anthropic Claude API** (for free-tier suggestions):
   - API key for Claude Haiku

### Setup Steps

1. **Database Setup**:
   ```bash
   # Follow instructions in database/README.md
   # Run schema.sql in Supabase SQL Editor
   # Enable anonymous authentication
   ```

2. **Frontend Configuration**:
   ```bash
   cd frontend
   cp .env.example .env
   # Add your API keys to .env
   npm install
   ```

## 📋 Next Steps (Phase 2: Core Features)

### Immediate Tasks
1. **Goal Components**:
   - GoalCard component (display individual goals)
   - GoalForm component with validation (create/edit)
   - GoalList component (filterable, sortable)

2. **Dashboard**:
   - DailyGoalsView (main focus area)
   - Weekly progress summary modal
   - Quick add goal button

3. **Progress System**:
   - Numeric progress input component
   - Checkbox + numeric hybrid tracking
   - Progress rollup calculation logic

4. **Pages**:
   - Dashboard page (daily goals + overview)
   - Settings page (API keys, preferences)
   - Goal details page (drill-down view)

5. **Integration**:
   - Wire up LLM suggestions to goal forms
   - Implement weekly notification trigger
   - Connect all stores to components

## 🎨 Design Philosophy

### Color Palette (Neutral Western Values)
- **Primary**: Slate grays (#f8fafc to #0f172a)
- **Success**: Muted green (#10b981)
- **Warning**: Muted amber (#f59e0b)
- **Danger**: Soft red (#ef4444)

### UX Principles
- **Daily goals front and center**: Main dashboard focus
- **Progressive disclosure**: Drill down from yearly → monthly → weekly → daily
- **Visual progress feedback**: Color-coded progress bars
- **Minimalist design**: Clean, professional, distraction-free

## 🚀 Running the App

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Data Flow

```
User Input → GoalForm → Zustand Store → Supabase (or LocalStorage)
                                    ↓
                            UI Components Update
                                    ↓
                            Progress Calculations
                                    ↓
                        Notification Triggers (Weekly)
```

## 🔄 Progress Rollup Logic

1. **Daily Goals**: User marks complete or updates numeric value
2. **Weekly Calculation**: Sum of daily completion / total daily goals
3. **Monthly Contribution**: Weekly progress / 4 weeks
4. **Yearly Contribution**: Monthly progress / 12 months
5. **Notification**: At end of week, popup shows all contributions

## 🧪 Testing Strategy

- Unit tests for utility functions
- Component tests for UI library
- Integration tests for stores
- E2E tests for critical user flows

## 📝 Development Guidelines

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with TypeScript
- **State**: Zustand for global, useState for local
- **Styling**: TailwindCSS utility classes
- **Validation**: Zod schemas for all forms
- **Errors**: Graceful error handling with user feedback

## 🎯 Success Metrics

- Fast initial load (< 2s)
- Smooth 60fps animations
- Accessible (WCAG AA)
- Mobile-responsive
- Offline-capable (local storage fallback)

---

**Status**: Phase 1 Complete (Foundation) ✅
**Next**: Phase 2 (Core Features) 🚧
**Timeline**: MVP in 3-4 more sessions

For questions or setup help, consult the database/README.md or frontend source comments.
