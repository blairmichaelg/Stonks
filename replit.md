# Institutional Financial Ecosystem Dashboard

## Overview

This is a 2026-generation institutional-grade financial backtesting and strategy management platform. The application enables users to define trading strategies using natural language, which are then parsed by AI into executable logic. The platform features sophisticated backtesting capabilities, AI agent monitoring, compliance tracking, and security threat visualization.

The core value proposition is bridging retail accessibility with institutional-grade precision through:
- Natural language to Domain-Specific Language (DSL) strategy translation
- Monte Carlo simulation-based backtesting
- Real-time AI agent coordination visualization
- Zero-trust security monitoring
- Regulatory compliance tracking (DORA, MiCA, GDPR ready)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom plugins for Replit integration
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, no client-side global state library
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Design System**: Carbon Design System inspired dark theme with IBM Plex fonts, optimized for data-dense financial interfaces
- **Charts**: Recharts for equity curves and performance visualization

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints defined in shared route contracts
- **Validation**: Zod schemas for request/response validation, shared between client and server

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (requires DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - contains all table definitions
- **Migrations**: Drizzle Kit with output to `./migrations`

### Key Data Models
- **Strategies**: Trading strategies with NLP input and AI-parsed JSON logic
- **Backtests**: Simulation results with equity curves, trades, and performance metrics
- **AI Agents**: Monitoring entities for risk, execution, and compliance
- **Compliance Logs**: Regulatory event tracking
- **Security Threats**: Threat detection and status tracking

### Service Layer
- **AI Service** (`server/services/ai.ts`): Dual-AI strategy parsing with Perplexity (primary) and Gemini (fallback)
- **Backtest Engine** (`server/services/backtest.ts`): Technical indicator calculation (RSI, MACD, SMA, ATR, Bollinger Bands) and trade simulation
- **Market Data Service** (`server/services/marketData.ts`): Historical price data from Alpha Vantage (stocks) and CoinGecko (crypto)

### Build System
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.cjs` with selective dependency bundling
- Development: Hot module replacement via Vite dev server proxied through Express

## External Dependencies

### AI Services
- **Perplexity API**: Primary strategy parsing (OpenAI-compatible endpoint)
- **Google Gemini API**: Fallback AI for strategy parsing
- Environment variables: `PERPLEXITY_API_KEY`, `GEMINI_API_KEY`

### Market Data APIs
- **Alpha Vantage**: Stock market historical data (TIME_SERIES_DAILY)
  - Rate limits: 5 calls/min, 500/day on free tier
  - Environment variable: `ALPHA_VANTAGE_API_KEY`
- **CoinGecko**: Cryptocurrency market data (free public API)

### Database
- **PostgreSQL**: Primary data store
- Environment variable: `DATABASE_URL` (required)
- Session store: connect-pg-simple for Express sessions

### Technical Analysis
- **technicalindicators**: NPM package for RSI, MACD, SMA, ATR, Bollinger Bands calculations

### UI Component Libraries
- **Radix UI**: Accessible primitive components (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library
- **Recharts**: Charting library for financial visualizations