# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yanzhi Cube (颜值立方) is a multilingual corpus management platform built with React 19 and Vite 6. The application provides corpus search, preview, and dashboard capabilities for linguistic datasets across 5 languages (Chinese, English, Thai, Vietnamese, Malay).

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (runs on port 3000, host 0.0.0.0)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Required Configuration**: Set `GEMINI_API_KEY` in `.env.local` before running the app.

## Architecture

### Tech Stack
- **Runtime**: Vite 6 with ES modules (type: "module")
- **Frontend**: React 19.2.4 with TypeScript 5.8.2
- **UI**: Tailwind CSS (via CDN) + Lucide React icons
- **Styling**: Utility-first CSS with Tailwind, Inter + JetBrains Mono fonts

### Project Structure

```
├── App.tsx                 # Main app with view routing (home/search/preview/dashboard)
├── index.tsx               # React entry point
├── index.html              # HTML shell with Tailwind CDN, importmap, custom config
├── components/
│   ├── LanguageContext.tsx # i18n context (zh/en/th/vi/ms languages)
│   ├── ui/Logo.tsx        # Reusable logo component
│   ├── Navbar.tsx          # Top navigation with language switcher
│   ├── Hero.tsx            # Home page search interface
│   ├── StatsOverview.tsx    # Corpus statistics overview
│   ├── Contributers.tsx    # Contributors section
│   ├── SearchResults.tsx    # Search results table with domain filters
│   ├── SamplePreview.tsx    # Detailed corpus sample view (Quad-Layer annotation)
│   └── Dashboard.tsx       # Data assets dashboard with KPIs and charts
└── vite.config.ts          # Vite config with path alias (@ = root dir)
```

### Key Architectural Patterns

**View Routing**: The app uses simple state-based routing (not React Router). `App.tsx` manages `view` state: `'home' | 'search' | 'preview' | 'dashboard'`. Navigation functions like `handleSearch`, `handleGoHome`, `handlePreview`, `handleDashboard` switch views and scroll to top.

**Internationalization (i18n)**: All translations stored in `LanguageContext.tsx` as a large object keyed by language code. Components use `useLanguage()` hook to access `t(key)` function. No external i18n library - hand-rolled context provider.

**Import Maps**: Dependencies loaded via ESM (esm.sh) through import map in `index.html`. Notably:
- React imports: `https://esm.sh/react@^19.2.4/`
- No local node_modules React in browser - uses CDN modules
- Lucide React also via CDN

**Path Aliases**: `@` mapped to root directory in both `tsconfig.json` and `vite.config.ts`. Use `@/components/...` for imports.

### Component Communication Patterns

**Language Pair Selection**: Used across `Hero.tsx`, `SearchResults.tsx`, `SamplePreview.tsx`. Pattern: two select dropdowns with validation preventing same language for source/target. Target select disabled until source selected.

**Domain Filtering**: Corpora categorized by business domain: `ecommerce | tourism | business | economy | general`. Each domain has color-coded badges in search results.

**Dashboard Views**: Dashboard supports three view modes:
- `overview`: KPI cards + timeline chart
- Language-specific views (when viewMode is language code): Not fully implemented
- Business scenario views (consultation/transaction/support/operations/feedback): Show intent analysis and channel sentiment

### Data Model

**Corpus Item Structure** (SearchResults.tsx):
```typescript
{
  id: number;
  name: string;           // e.g., "OpenSubtitles v2018"
  sentences: string;         // Formatted count, e.g., "1,204,500"
  sTok: string;             // Source token count
  tTok: string;             // Target token count
  tags: ScenarioTag[];      // Domain application tags
}
```

**Quad-Layer Annotation System** (SamplePreview.tsx):
- `basic_layer`: sentence_id, timestamp, platform
- `language_layer`: source_text_zh, raw_text_ms, normalized_text_ms, english_loanwords
- `pragmatic_layer`: intent[], sentiment, business_scenario
- `style_layer`: style, contains_rojak, abbreviations_handled

### Styling Conventions

- **Colors**: Primary blue palette (`primary-50` to `primary-900`), slate grays for text/borders
- **Typography**: Inter for sans-serif, JetBrains Mono for mono/numbers
- **Components**: Extensive use of rounded-xl, border-slate-200, shadow-sm for cards
- **Responsive**: Heavy use of `hidden lg:block` type utilities for progressive disclosure
- **State**: Disabled states use `bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed`

## Configuration Files

**vite.config.ts**:
- Server: port 3000, host 0.0.0.0
- Environment variables: `process.env.GEMINI_API_KEY` injected via `define`
- Path alias: `@` → project root

**tsconfig.json**:
- Target: ES2022
- JSX: react-jsx (automatic runtime)
- Module resolution: bundler (Vite-native)
- Paths: `@/*` maps to `./*`
