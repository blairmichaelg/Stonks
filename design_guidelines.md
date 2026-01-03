# Institutional Financial Ecosystem Dashboard Design Guidelines

## Design Approach: Carbon Design System (IBM) - Enterprise Data Applications

**Rationale**: Carbon excels at data-dense, enterprise interfaces with sophisticated dark themes and high-contrast visualizations. Perfect for institutional-grade financial platforms requiring information hierarchy and operational efficiency.

---

## Core Design Elements

### Typography
**Primary Font**: IBM Plex Sans (via Google Fonts CDN)
- Dashboard Headers: 24px/600 weight
- Panel Titles: 16px/500 weight
- Data Labels: 14px/400 weight
- Metrics/Numbers: IBM Plex Mono 18px/500 (for tabular data)
- Micro-text (timestamps): 12px/400 weight

### Layout System
**Tailwind Spacing Primitives**: 2, 3, 4, 6, 8, 12
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Margins: m-2, m-4
- Grid gaps: gap-3, gap-4

**Grid Architecture**:
- Main dashboard: 12-column grid (grid-cols-12)
- Primary panels: spans of 8-9 columns
- Secondary panels/widgets: 3-4 columns
- Responsive: Stack to single column on mobile

---

## Component Library

### Navigation
**Top Bar** (h-16, fixed):
- Logo/Platform name (left)
- Global search with AI-powered suggestions
- Real-time system status indicators (quantum-ready badge, zero-trust status)
- User profile with security clearance level
- Emergency alert system indicator

**Left Sidebar** (w-64, collapsible to w-16):
- Primary navigation: Market Overview, Risk Dashboard, Compliance Monitor, AI Agents, Security Center
- Active state: 4px left border accent
- Icons: Heroicons (outline style)

### Dashboard Panels
**Panel Structure**:
- Header with title, timeframe selector, and action menu (h-12)
- Content area with 2-4px subtle border
- Compact padding (p-4)
- Elevation: Subtle shadow for layering

**Widget Types**:
1. **Market Microstructure Visualization**: Real-time order book depth, trade flow heatmaps (6-8 column span)
2. **Agentic AI Risk Scores**: Multi-metric cards with severity indicators, trend sparklines (3-4 column span each)
3. **Exchange Fingerprints**: Radar charts, comparative scatter plots (4 column span)
4. **Compliance Timeline**: Horizontal event stream with regulatory flags (full-width)
5. **Zero-Trust Security Monitor**: Live connection map, threat detection grid (6 column span)

### Data Visualization Elements
- Heatmaps: High-contrast gradients (critical → neutral states)
- Charts: Recharts library via CDN, customized for dark theme
- Real-time updates: Pulse animations on data changes (300ms transition)
- Sparklines: Inline trend indicators (h-8 to h-12)
- Status Indicators: Dot icons (w-2 h-2) with color coding

### Forms & Controls
- Timeframe selectors: Segmented button groups (1H, 4H, 1D, 1W, 1M)
- Filters: Multi-select dropdowns with search
- Toggle switches: For real-time updates, AI agent activation
- Date/time pickers: Native HTML5 with custom styling

### Overlays
- Modal dialogs: 600px max-width, centered, backdrop blur
- Alert banners: Top-positioned, dismissible (h-12)
- Tooltips: On hover for complex metrics, 200ms delay

---

## Images Section

**No Hero Image**: This is a functional dashboard application, not a marketing site.

**Supporting Visuals**:
- **Empty State Illustrations**: Minimal line-art graphics for inactive AI agents or no-data states
- **Security Badges**: SVG icons for quantum-ready, zero-trust certifications in top bar
- **Exchange Logos**: Small icons (24px) next to exchange fingerprint data

---

## Layout Specifications

**Dashboard Structure**:
```
Top Bar (full-width, h-16)
├─ Sidebar (w-64) + Main Content Area
   ├─ Dashboard Header (h-20): Title, global filters, export controls
   ├─ Critical Alerts Row (h-16, conditional)
   ├─ Primary Metrics Grid (4 cards, grid-cols-4, gap-4)
   ├─ Main Visualization Row (grid-cols-12, gap-4)
   │  ├─ Market Microstructure (col-span-8)
   │  └─ AI Risk Scoring (col-span-4)
   ├─ Secondary Analysis Row (grid-cols-12, gap-4)
   │  ├─ Exchange Fingerprints (col-span-5)
   │  ├─ Security Monitor (col-span-7)
   └─ Compliance Timeline (full-width)
```

**Density**: Information-rich, minimal whitespace. Vertical spacing between rows: space-y-4. Horizontal rhythm maintained through consistent 4-unit grid gaps.

---

## Animation Principles
**Minimal & Purposeful**:
- Real-time data updates: 200ms fade transitions
- Panel expand/collapse: 300ms ease-out
- Critical alerts: Subtle pulse (once on appear)
- NO decorative animations, scroll effects, or parallax

---

## Key Design Principles
1. **Intelligence-First**: AI insights prominently displayed, predictive indicators visible
2. **Scannable Hierarchy**: Size, weight, and spacing create clear information tiers
3. **Operational Efficiency**: All critical functions within 2 clicks
4. **Trust Indicators**: Security status, regulatory compliance always visible
5. **Future-Ready**: Quantum-ready badges, autonomous agent status integrated naturally