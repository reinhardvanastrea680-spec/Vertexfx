# VertexFX Broker Platform — Admin Dashboard Specification

**Document Version:** 1.0  
**Prepared For:** Development Team & Employer Review  
**Project:** VertexFX — Admin Control Panel  
**Framework:** React (TypeScript) + Tailwind CSS  
**Classification:** Internal Technical Reference

---

## TABLE OF CONTENTS

1. Overview & Purpose
2. Design System & Colour Theme
3. Technology Stack
4. User Roles & Access Control
5. Navigation & Layout Architecture
6. Module 1 — Main Dashboard (Overview)
7. Module 2 — User Management
8. Module 3 — KYC Verification Centre
9. Module 4 — Trading Operations
10. Module 5 — Financial Operations (Deposits & Withdrawals)
11. Module 6 — Risk Management
12. Module 7 — Reports & Analytics
13. Module 8 — AML & Compliance
14. Module 9 — Instrument Management
15. Module 10 — Bonus & Promotions Manager
16. Module 11 — Referral Programme Manager
17. Module 12 — Communications Centre
18. Module 13 — System Configuration
19. Module 14 — Audit Trail
20. Module 15 — Staff Access Management
21. Global UI Components

---

## 1. OVERVIEW & PURPOSE

The VertexFX Admin Dashboard is a private, internal web application accessible only to authorised staff. It serves as the central command centre from which the entire broker business is monitored, managed, and controlled in real time.

This is not a public-facing product — it is a professional operational tool. The design must communicate authority, clarity, and precision. Every page should give a staff member everything they need to act decisively without clutter or ambiguity.

The admin dashboard is built as a completely separate React application from the client-facing frontend. It shares the same backend API but connects to admin-only endpoints. It is deployed to a separate domain (e.g., `admin.vertexfx.com`) with IP whitelisting enforced at the server level — only office IP addresses and approved VPN connections can access it.

### Who Uses This Dashboard

| Role | What They Do |
|---|---|
| **Super Admin** | Full access to everything, including staff management and system settings |
| **Admin** | Full operational access except staff management |
| **Compliance Officer** | KYC review, AML monitoring, report exports |
| **Finance Officer** | Withdrawal approvals, deposit management, transaction reports |
| **Support Agent** | Read-only access to user profiles, trading history, basic account adjustments |
| **Risk Manager** | Open positions monitoring, margin level alerts, instrument risk settings |

---

## 2. DESIGN SYSTEM & COLOUR THEME

### Design Philosophy

The admin dashboard uses a **dark professional theme** — it will be looked at for hours at a time by financial professionals. The palette must reduce eye strain, convey seriousness, and use colour purposefully to communicate system state (warnings, errors, healthy metrics).

The aesthetic is inspired by institutional trading terminals and enterprise financial software: structured, dense with information but never chaotic, with clear visual hierarchy.

### Colour Palette

```
BACKGROUND COLOURS
────────────────────────────────────
Primary Background:     #0B0F1A    (deepest — page background, sidebar)
Secondary Background:   #111827    (card backgrounds, panels)
Elevated Background:    #1A2235    (table rows hover, modal backgrounds)
Divider / Border:       #1F2D45    (borders, separators)
Input Background:       #141C2E    (form fields, search boxes)

PRIMARY ACCENT (Brand Gold)
────────────────────────────────────
Gold Bright:            #D4A843    (primary CTAs, active nav items, headings accent)
Gold Muted:             #A07728    (hover states, secondary gold elements)
Gold Subtle:            rgba(212,168,67,0.12) (backgrounds for gold highlights)

SECONDARY ACCENT (Teal / Cyan)
────────────────────────────────────
Teal Bright:            #0BCEAF    (active indicators, live data, status online)
Teal Muted:             #0A9E88    (secondary teal elements)
Teal Subtle:            rgba(11,206,175,0.10) (teal highlight backgrounds)

TEXT COLOURS
────────────────────────────────────
Primary Text:           #E8EDF5    (main headings, important data)
Secondary Text:         #8B97B5    (labels, subtext, column headers)
Tertiary Text:          #4E5E7A    (placeholder text, disabled states)
Link Text:              #4F9CF8    (clickable links)

STATUS / SEMANTIC COLOURS
────────────────────────────────────
Success Green:          #22C55E    (approved, profit, positive change)
Success Background:     rgba(34,197,94,0.10)
Warning Amber:          #F59E0B    (pending, caution, medium risk)
Warning Background:     rgba(245,158,11,0.10)
Danger Red:             #EF4444    (rejected, loss, high risk, critical alerts)
Danger Background:      rgba(239,68,68,0.10)
Info Blue:              #3B82F6    (informational, neutral status)
Info Background:        rgba(59,130,246,0.10)

CHART COLOURS (for data visualisations)
────────────────────────────────────
Chart 1 — Gold:         #D4A843
Chart 2 — Teal:         #0BCEAF
Chart 3 — Blue:         #3B82F6
Chart 4 — Purple:       #8B5CF6
Chart 5 — Red:          #EF4444
Chart 6 — Orange:       #F97316
```

### Typography

```
Font Family (Primary):    'Inter', sans-serif
Font Family (Numbers):    'JetBrains Mono', monospace
  (Used for all financial figures: balances, prices, P&L values)

Font Sizes:
  xs:   11px  — table metadata, timestamps
  sm:   12px  — table cells, badges, labels
  base: 14px  — body text, form labels
  lg:   16px  — section subheadings
  xl:   20px  — card titles, page subheadings
  2xl:  24px  — KPI metric values
  3xl:  30px  — major headline figures
  4xl:  36px  — hero statistics

Font Weights:
  Regular:   400
  Medium:    500
  Semibold:  600
  Bold:      700
```

### Spacing & Layout

```
Border Radius:
  sm:   4px   — badges, chips
  md:   8px   — buttons, inputs, small cards
  lg:   12px  — cards, panels
  xl:   16px  — modals, large panels

Shadows:
  Card shadow: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
  Modal shadow: 0 20px 60px rgba(0,0,0,0.7)

Sidebar Width:      260px (expanded) / 72px (collapsed)
Header Height:      64px
Content Padding:    24px
Card Padding:       20px–24px
Table Row Height:   48px
```

---

## 3. TECHNOLOGY STACK

### Core Framework
- **React 18** with TypeScript — All components are functional with hooks
- **Vite** — Build tool (faster than CRA for development)

### State Management
- **Zustand** — Lightweight global state for auth session, UI state, real-time data
- **TanStack Query (React Query)** — Server state, API data fetching, caching, background refetch

### Routing
- **React Router v6** — Client-side routing with protected route guards

### UI & Styling
- **Tailwind CSS** — Utility-first styling with custom theme config extending the colour palette above
- **shadcn/ui** — Accessible, composable components (Dialog, Tooltip, Dropdown, Popover) styled with Tailwind

### Data Tables
- **TanStack Table (React Table v8)** — Powerful headless table with sorting, filtering, pagination, column resizing. All data-heavy tables in this dashboard use this library.

### Charts & Data Visualisation
- **Recharts** — Line charts, area charts, bar charts for financial data
- **Lightweight Charts (TradingView)** — The embedded price chart on trading pages

### Forms
- **React Hook Form** — All forms use this for performance and validation
- **Zod** — Schema validation on the client side (mirrors backend validation)

### Real-Time
- **Socket.io client** — Live position monitoring, balance updates, new KYC alert toasts

### Date & Time
- **date-fns** — All date formatting and manipulation

### Utilities
- **axios** — HTTP client with interceptors for auth token injection and 401 handling
- **react-hot-toast** — Notification toasts
- **react-dropzone** — File upload zones for document review sections
- **recharts** — Charts and analytics

---

## 4. USER ROLES & ACCESS CONTROL

Implement role-based access control (RBAC) on the frontend using a `usePermissions` hook. Every module, button, and form action is conditionally rendered based on the logged-in admin's role.

### Permission Matrix

| Feature | Super Admin | Admin | Compliance | Finance | Support | Risk Manager |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✓ | ✓ | — | — | View only | — |
| Suspend/ban users | ✓ | ✓ | — | — | — | — |
| Approve KYC | ✓ | ✓ | ✓ | — | — | — |
| Approve withdrawals | ✓ | ✓ | — | ✓ | — | — |
| View all transactions | ✓ | ✓ | ✓ | ✓ | View own users | — |
| Force-close trades | ✓ | ✓ | — | — | — | ✓ |
| AML review | ✓ | ✓ | ✓ | — | — | — |
| Manage instruments | ✓ | ✓ | — | — | — | ✓ |
| Manage bonuses | ✓ | ✓ | — | ✓ | — | — |
| Export reports | ✓ | ✓ | ✓ | ✓ | — | — |
| System settings | ✓ | — | — | — | — | — |
| Manage staff | ✓ | — | — | — | — | — |
| View audit logs | ✓ | ✓ | ✓ | — | — | — |

---

## 5. NAVIGATION & LAYOUT ARCHITECTURE

### Layout Structure

The overall page layout is a classic admin shell:

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR  (Header — 64px height)                         │
│  [Logo] [Global Search]    [Alerts] [User Avatar] [...]  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  SIDEBAR   │  MAIN CONTENT AREA                         │
│  (260px)   │  (scrollable, padding 24px)                │
│            │                                            │
│  Nav items │  Page title + breadcrumb                   │
│  with icon │  ─────────────────────                    │
│  + label   │  Page content (modules)                    │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Topbar Components

- **Logo** — VertexFX logo (gold V mark + wordmark)
- **Global Search Bar** — Searches users by email, name, account number, transaction ID. Shows dropdown results instantly. Clicking a result navigates to that record.
- **Live Clock** — Current UTC time (financial operations use UTC)
- **Notification Bell** — Dropdown showing unread alerts (new KYC, new withdrawal, AML flag, margin call). Unread count badge. Clicking opens the full notifications panel.
- **Active Users Indicator** — "1,234 online" with a green dot (fetched every 30s)
- **Admin Profile Menu** — Avatar + name + role badge. Dropdown: My Profile, Change Password, Logout.

### Sidebar Navigation

Groups and items:

```
OVERVIEW
  ├── Dashboard            (icon: layout-dashboard)

CLIENTS
  ├── All Users            (icon: users)
  ├── KYC Verification     (icon: shield-check) [pending count badge]
  ├── User Activity        (icon: activity)

TRADING
  ├── Live Positions       (icon: trending-up) [open positions count]
  ├── Trade History        (icon: history)
  ├── Instruments          (icon: bar-chart-2)

FINANCE
  ├── Deposits             (icon: arrow-down-circle)
  ├── Withdrawals          (icon: arrow-up-circle) [pending count badge]
  ├── Transactions         (icon: repeat)
  ├── Ledger               (icon: book-open)

RISK & COMPLIANCE
  ├── Risk Monitor         (icon: alert-triangle)
  ├── AML Alerts           (icon: search) [flagged count badge]
  ├── Compliance Reports   (icon: file-text)

ANALYTICS
  ├── Overview Reports     (icon: pie-chart)
  ├── Financial Reports    (icon: dollar-sign)
  ├── Trading Reports      (icon: bar-chart)
  ├── Client Reports       (icon: user-check)

MARKETING
  ├── Bonuses              (icon: gift)
  ├── Referral Programme   (icon: share-2)
  ├── Announcements        (icon: megaphone)

ADMINISTRATION
  ├── Staff Management     (icon: user-cog)  [Super Admin only]
  ├── Audit Logs           (icon: clipboard-list)
  ├── System Settings      (icon: settings)  [Super Admin only]
```

Active nav item: Gold left border + gold text + subtle gold background tint.
Hover state: Slightly lighter background.
Badges: Small pill in Danger Red for urgent counts, Amber for pending items.

---

## 6. MODULE 1 — MAIN DASHBOARD (OVERVIEW)

The first screen seen after login. Gives a real-time bird's-eye view of the entire platform.

### KPI Cards Row (Top)

Display 8 metric cards in a 4-column grid (two rows):

**Row 1 — Business Health**
1. **Total Active Users** — Count of `status = 'active'` users. Delta: +X vs yesterday.
2. **Total AUM** — Sum of all live trading account balances in USD. With delta.
3. **Today's Deposits** — Total deposits processed today. Transaction count + total value.
4. **Today's Withdrawals** — Total withdrawals processed today.

**Row 2 — Operations**
5. **Open Positions** — Total count of open positions right now. Updates every 30s.
6. **Pending KYC** — Count of KYC submissions awaiting review. Clicking navigates to KYC module.
7. **Pending Withdrawals** — Count of withdrawal requests awaiting approval.
8. **AML Alerts** — Count of unresolved AML flags.

Card design: Dark card background, muted label above, large monospace number below, delta indicator with green up-arrow or red down-arrow, and a small sparkline mini-chart showing the last 7 days trend.

### Charts Row

**Revenue Chart (60% width)**
- Recharts AreaChart
- Shows daily net revenue (commission + spread income) for the past 30 days
- Two overlapping area series: "Trading Revenue" (gold) and "Deposit Fees" (teal)
- Hover tooltip shows breakdown by revenue type
- Toggle buttons to switch between 7D / 30D / 90D / 1Y

**New Registrations Chart (40% width)**
- Recharts BarChart
- Shows daily new user registrations for the past 30 days
- Bars coloured gold, with a teal line overlay showing KYC completion rate
- Hover tooltip shows: new registrations, of which KYC completed, of which funded

### Live Activity Feed

Real-time list of platform events, streamed via WebSocket. Each item shows:
- Timestamp
- Event type badge (colour-coded): TRADE, DEPOSIT, WITHDRAWAL, KYC, ALERT
- Description: e.g. "User john.doe@gmail.com opened BUY 0.5 EURUSD at 1.0848"
- Clickable — navigates to relevant record

Maximum 50 items displayed, newest at top, auto-scrolls to new items.

### Geographic Distribution Map

World map (simple SVG choropleth using react-simple-maps or D3) showing user distribution by country. Darker shading = more users. Hovering a country shows: "Nigeria — 12,430 users, $2.1M AUM". Helps with business and compliance insight.

### Top Traders Table

A compact table showing the top 10 traders by trading volume this month:
- Rank, Name, Account Number, Country, Volume (lots), P&L, Account Balance.
- Clicking a row navigates to that user's full profile.

### Platform Status Bar (Bottom)

A horizontal status bar showing:
- API Server: ● Online (green dot)
- Database: ● Online
- Redis Cache: ● Online
- MT5 Bridge / Price Feed: ● Online / ● Degraded / ● Offline
- Payment Gateway — Stripe: ● Online
- Payment Gateway — Flutterwave: ● Online
- Last price feed tick: "EURUSD — 0.3s ago"

If any service is degraded or offline, the status bar turns amber/red and a persistent banner appears at the top of all admin pages.

---

## 7. MODULE 2 — USER MANAGEMENT

### Page: All Users

**Top Section — Filters & Search**
- Search box: filter by name, email, phone, account number
- Filter dropdowns: Status (All / Active / Pending / Suspended / Banned), KYC Status, Country, Registration Date range, Account Tier
- Sort by: Registration Date, Last Login, Balance (desc)
- Export button: download filtered results as CSV or Excel

**Users Table (TanStack Table)**

Columns:
1. Checkbox (bulk select)
2. User — Avatar initials circle + Full Name + Email (clickable → user detail)
3. Account # — First trading account number
4. Country — Flag emoji + country name
5. Status — Colour-coded badge (Active=green, Pending=amber, Suspended=red)
6. KYC — Badge (Approved=green, Pending=amber, Not Submitted=grey, Rejected=red)
7. Balance — Monospace number, total wallet balance in USD
8. Registered — Date, formatted as "14 Jan 2025"
9. Last Login — Relative ("2 hours ago") with tooltip showing exact datetime
10. Actions — Three-dot menu: View Profile, Send Email, Suspend, Flag for Review

Pagination: 25 / 50 / 100 rows per page. Server-side pagination.

**Bulk Actions** (appears when rows selected):
- Suspend Selected
- Send Email to Selected
- Export Selected

---

### Page: User Detail Profile

Accessed by clicking a user row. A full-page view organised into tabs.

**Header Section (always visible)**
- Large avatar/initials
- Full name, email, phone
- Status badge + KYC badge
- Registration date, last login, country
- Quick Action buttons: Suspend / Activate / Send Message / Add Note / Adjust Balance

---

**Tab 1: Personal Information**
- All profile fields: name, DOB, address, nationality
- Edit button opens an inline form (admin can correct data)
- Linked accounts section: all trading accounts with balances

**Tab 2: KYC Documents**
- All submitted documents with preview thumbnails
- Each document: type, submission date, status, reviewer name
- "Review" button opens a side panel with full-size document viewer
- Approve / Reject buttons with rejection reason textarea

**Tab 3: Trading Accounts**
- Table of all accounts (live + demo)
- Columns: Account #, Type, Tier, Currency, Balance, Equity, Open Positions count, Status, Platform
- Actions per account: View Trades, Suspend, Adjust Balance (opens form), Change Leverage
- "Create Account" button to manually provision a new trading account for the user

**Tab 4: Trade History**
- All historical and open trades
- Columns: Ticket, Symbol, Direction, Volume, Open Price, Close Price, Open Time, Close Time, P&L, Commission, Swap
- Filter by: Status (open/closed), Symbol, Date range
- Sortable by P&L, Date

**Tab 5: Financial History**
- All deposits and withdrawals
- Columns: Transaction ID, Type, Method, Amount, Status, Date, Reference
- Shows balance before and after for each transaction

**Tab 6: Login & Security**
- Login history table: Timestamp, IP Address, Device, Location (geo-IP), Status (success/failed)
- Active sessions list with revoke option
- 2FA status (enabled/disabled)
- Password reset history
- Security flags: "Account flagged for suspicious login patterns" (with timestamp)

**Tab 7: Notes & Flags**
- Internal notes system — staff can add timestamped notes visible only to other staff
- Flags system: "AML Review Needed", "VIP Client", "Do Not Withdraw Without Approval"
- Note form: textarea + "Add Note" button, author + timestamp auto-recorded

---

## 8. MODULE 3 — KYC VERIFICATION CENTRE

This module is the compliance team's primary workspace.

### Page: KYC Queue

**Stats Bar (top)**
- Pending Reviews: X
- Approved Today: X
- Rejected Today: X
- Average Review Time: X hours

**Filter Tabs**
- All | Pending | Approved | Rejected | Resubmission Required

**KYC Submissions Table**
Columns:
1. User — Name + email
2. Country
3. Document Type — National ID, Passport, etc.
4. Submitted — Date + time
5. Days Waiting — Highlights red if > 2 days
6. Status — Badge
7. Assigned To — Which compliance officer is reviewing (or Unassigned)
8. Actions — "Review" button (primary), "Assign to Me"

Clicking "Review" opens a full-screen review panel.

---

### KYC Review Panel (Full Screen Modal/Page)

**Left Side — Document Viewer**
- Large document image with zoom controls
- Toggle between front / back / selfie
- Download original file button
- Rotate image button (documents sometimes uploaded sideways)
- Image enhancement controls: brightness, contrast (helps verify faint text)

**Right Side — Review Form**
- User summary: photo, name, DOB, address (from profile)
- Document details extracted: document number, expiry date, country of issue (editable if extraction failed)
- Automated check results (if KYC API integrated): biometric match score, document authenticity score, liveness check result
- Manual checklist:
  - [ ] Document matches name on profile
  - [ ] Document is not expired
  - [ ] Photo clearly visible and matches selfie
  - [ ] Address proof is less than 3 months old
  - [ ] Document is from acceptable country
- Decision: **Approve** (green) or **Reject** (red)
- Rejection reason dropdown (pre-set options): "Document expired", "Photo unclear", "Name mismatch", "Document type not accepted", "Suspected forgery" + free text field
- Submit Decision button

---

## 9. MODULE 4 — TRADING OPERATIONS

### Page: Live Positions Monitor

This is the real-time trading heartbeat of the platform.

**Summary Bar**
- Total Open Positions: X
- Total Floating P&L: $X,XXX.XX (updated every second, green if positive, red if negative)
- Total Exposure: $X,XXX,XXX (total notional value of all open positions)
- Positions at Margin Call: X (highlighted amber)
- Positions Near Stop-Out: X (highlighted red)

**Live Positions Table** (auto-refreshes every 2 seconds via WebSocket)
Columns:
1. Ticket # — Monospace
2. User — Name + Account #
3. Symbol
4. Direction — BUY (green badge) / SELL (red badge)
5. Volume (lots)
6. Open Price — Monospace
7. Current Price — Monospace, colour flashes green/red on update
8. Stop Loss
9. Take Profit
10. Floating P&L — Large monospace, green or red, updates live
11. Margin Used
12. Margin Level % — Red if < 150%, amber if < 300%
13. Open Time — Duration (e.g. "2h 34m")
14. Actions — Force Close, Modify SL/TP

**Force Close Confirmation Modal**
When an admin clicks Force Close: a modal requires confirmation with a reason (dropdown: "Margin Call", "Risk Management", "Error Correction", "Client Request") and notes field. All force-closes recorded in audit log with reason.

---

### Page: Trade History

Full paginated history of all trades across all accounts.

**Filters:**
- User search
- Symbol filter
- Direction (Buy/Sell)
- Date range
- Status (Open / Closed)
- Account type (Live / Demo)
- Minimum P&L

**Table Columns:**
Ticket, User, Account #, Symbol, Direction, Volume, Open Price, Close Price, P&L, Commission, Swap, Net P&L, Open Time, Close Time, Duration, Platform

**Summary stats** at bottom of filtered results:
- Total Volume Traded (lots)
- Total Commission Collected
- Sum of P&L (what clients made/lost overall)
- Total Net Revenue to Broker

**Export:** CSV, Excel, PDF report.

---

### Page: Instrument Management

**Instruments Table**
All tradeable instruments with their current configuration.
Columns: Symbol, Category, Min Spread, Commission/Lot, Swap Long, Swap Short, Min Lot, Max Lot, Status, Actions

**Edit Instrument Panel (Side Sheet)**
Opens when clicking Edit:
- All instrument fields editable (spread, commissions, swap rates, leverage, trading hours)
- Trading hours: a visual weekly schedule grid (click cells to mark as open/closed per 30-min slot per day)
- Enable/Disable toggle (immediately stops new orders on this instrument)
- "Apply to all same-category instruments" checkbox for batch updates to commissions/swaps

**Add New Instrument**
Full form to add a new tradeable instrument.

---

## 10. MODULE 5 — FINANCIAL OPERATIONS

### Page: Withdrawal Requests

**Priority Queue — this is where money leaves the business. Treat with maximum care.**

**Stats Bar**
- Pending: X requests totalling $X,XXX
- Approved Today: X requests totalling $X,XXX
- Rejected Today: X
- Average Processing Time: X hours

**Withdrawal Queue Table**
Columns:
1. Request ID — Monospace
2. User — Name + KYC badge
3. Amount — Large, monospace
4. Currency
5. Method — Badge (Bank Transfer, Crypto, etc.)
6. Bank Account — Last 4 digits of account number
7. KYC Level
8. Requested At
9. Time Waiting — Red if > 24 hours
10. Status
11. AML Flag — Warning icon if flagged
12. Actions — Approve (green) / Reject (red) / View Details

**Withdrawal Detail Panel (Side Sheet)**
Opens on "View Details":
- Full user profile summary with KYC status
- All bank account details
- Transaction history for this user (last 30 days)
- This specific withdrawal details
- Anti-fraud checks panel:
  - "User KYC fully verified: ✓"
  - "Withdrawal amount within 30-day limit: ✓"
  - "Bank account previously used successfully: ✓"
  - "No AML flags on this account: ✓" or "⚠ AML flag exists — review required"
  - "Account balance after withdrawal: $XXX.XX"
- Approve button: triggers payment initiation, records in audit log
- Reject button: opens reason selection + notes, sends rejection email to user

---

### Page: Deposits

**Stats Bar**
- Today's total deposits
- This week
- This month
- Failed deposits today

**Deposits Table**
Columns: Transaction ID, User, Amount, Method, Gateway Reference, Status, Date

Failed deposit filter: Shows all failed payment attempts. Admin can manually investigate and credit if bank confirms payment received.

**Manual Deposit Credit**
For bank wire transfers paid outside of an automated gateway:
- Search user
- Enter amount and currency
- Upload proof (bank confirmation document)
- Reference number
- Submit for approval → requires second admin approval if over a threshold (e.g. $5,000)

---

### Page: All Transactions

Complete ledger view. Every financial record.

**Filters:** Date range, User, Type (deposit/withdrawal/bonus/adjustment), Status, Method, Amount range

**Table:** All transaction columns including before/after balances.

**Adjustments**
- Admins can create manual account balance adjustments (credit or debit)
- Requires: amount, reason (dropdown), supporting note
- Adjustment over $500 requires Super Admin approval
- All adjustments recorded in audit log with before/after balance

---

## 11. MODULE 6 — RISK MANAGEMENT

### Page: Risk Monitor

The real-time risk dashboard used by the Risk Manager.

**Exposure Summary**
- Total Long Exposure: $X,XXX,XXX
- Total Short Exposure: $X,XXX,XXX
- Net Exposure: $X,XXX (long - short = broker's net position risk)
- Largest single user exposure: User name + amount

**Exposure by Instrument (Bar Chart)**
Horizontal bar chart showing the top 10 most exposed instruments. Two bars per instrument: long volume (gold) vs short volume (teal). Large imbalances are flagged.

**Accounts at Risk Table**
Sorted by margin level ascending (lowest margin level = most at-risk accounts at top):
- User, Account #, Balance, Equity, Margin Level %, Open Positions count, Floating P&L
- Row colours:
  - Margin Level < 50%: red row (stop-out imminent)
  - Margin Level 50–100%: amber row (margin call zone)
  - Margin Level 100–200%: yellow warning

**Risk Settings Panel**
- Margin Call Level (%): input field with save
- Stop-Out Level (%): input field with save
- Maximum Leverage per category: inputs for forex, crypto, indices, etc.
- Maximum single position size (lots): per instrument category
- These settings flow directly to the trading engine

---

## 12. MODULE 7 — REPORTS & ANALYTICS

### Page: Overview Reports

**Date Range Selector** (top, always visible on reports pages):
Quick select: Today / This Week / This Month / Last Month / This Quarter / Custom Range

**Revenue Breakdown Card**
Pie chart + table showing revenue sources:
- Spread income (estimated)
- Commission income
- Swap income
- Deposit fees
Total revenue figure prominently displayed.

**Volume & Revenue Trend**
Dual-axis line chart: trading volume (lots) on left axis, revenue ($) on right axis, over selected date range.

**Client Lifecycle Funnel**
A funnel visualisation:
- Registered → Email Verified → KYC Submitted → KYC Approved → First Deposit → First Trade
Shows conversion rates at each stage (e.g. 68% of registered users verify email, 45% complete KYC, etc.)
This directly informs marketing and onboarding improvements.

---

### Page: Financial Reports

- Deposits report: by method, by country, by amount range, over time
- Withdrawals report: same dimensions
- Net cash flow (deposits minus withdrawals) over time
- Revenue P&L statement (broker revenue vs costs)
- Daily/weekly/monthly reconciliation summary

All reports exportable as PDF or CSV.

---

### Page: Trading Reports

- Total trading volume by symbol, category, period
- Most traded instruments
- Average trade duration
- Win rate (% of trades that are profitable for clients — useful for product analysis)
- Profit factor by account tier

---

### Page: Client Reports

- New registrations over time
- KYC completion rates
- Activation rates (% who deposit after registering)
- Retention rates (active traders month over month)
- Geographic breakdown
- Account tier distribution

---

## 13. MODULE 8 — AML & COMPLIANCE

### Page: AML Alerts

**Alert Queue Table**
Columns: Alert ID, User, Alert Type, Transaction ID, Amount, Risk Score, Created At, Status, Assigned To, Actions

Alert Types (with colour badges):
- Large Cash Deposit (amber)
- Structuring Suspected (red)
- Rapid Deposit-Withdrawal (red)
- Sanctions List Match (red — highest priority)
- Unusual Geographic Activity (amber)
- Velocity Alert (multiple transactions in short window) (amber)

**Alert Detail Page**
- Full user profile and KYC status
- The specific flagged transaction(s)
- Related transactions (past 90 days for context)
- Risk score breakdown: what factors triggered the score
- Actions:
  - Clear Alert: no action required, record clearing reason
  - Escalate: mark as requiring senior compliance review
  - File SAR (Suspicious Activity Report): opens SAR form
  - Freeze Account: immediately suspends deposits and withdrawals pending investigation

**SAR Filing Form**
A structured form capturing all information required for a Suspicious Activity Report per standard financial regulation (client details, account info, suspicious transactions, reason for suspicion). Outputs a PDF that can be submitted to the relevant financial intelligence unit.

---

## 14. MODULE 9 — INSTRUMENT MANAGEMENT

(Additional details beyond what was covered in Trading Operations)

### Instruments Catalogue Page

**Category Tabs:** Forex | Crypto | Stocks | Commodities | Indices | ETFs

**Per-instrument configuration panel includes:**
- Current live bid/ask (fetched from the price feed)
- Spread history chart (shows how spread has changed over the last 7 days)
- Trading hours: visual weekly grid
- Holiday schedule: dates when instrument is closed
- Leverage settings by account tier (Standard vs Pro vs RAW ECN can have different max leverage)
- Commission schedule: flat per lot or percentage
- Enable/Disable with confirmation dialog explaining impact (all new orders blocked, existing positions unaffected)

---

## 15. MODULE 10 — BONUS & PROMOTIONS MANAGER

### Page: Active Bonuses

Table of all currently active client bonuses:
- User, Bonus Type, Amount, Wagering Progress (progress bar), Status, Expiry

**Create New Bonus**
Form fields:
- Bonus type (welcome, deposit match, manual)
- Target: specific user or all users matching a filter
- Amount or percentage (for deposit match)
- Wagering requirement (lots needed before withdrawal allowed)
- Expiry date
- Terms text (shown to client)

**Promotional Campaign Manager**
Create timed campaigns (e.g. "100% Deposit Match — New Year Promotion"):
- Campaign name and description
- Start/end date
- Eligibility criteria (minimum deposit, account tier, country)
- Bonus parameters
- Track uptake: how many users enrolled, total bonus liability

---

## 16. MODULE 11 — REFERRAL PROGRAMME MANAGER

### Page: Referral Overview

**Stats Cards:**
- Total Referrers
- Total Referred Users
- Total Commissions Paid
- Pending Commissions to Pay

**Referrals Table**
Columns: Referrer Name, Referred User, Referred Date, First Deposit Date, First Deposit Amount, Commission Earned, Status

**Programme Settings**
- Commission type: flat fee per qualified referral or % of referred user's trading volume
- Qualification criteria: minimum first deposit required, must be KYC approved
- Commission payout: manual or automatic, minimum threshold for payout

---

## 17. MODULE 12 — COMMUNICATIONS CENTRE

### Page: Announcements

**Active Announcements Table**
All current system announcements shown to clients:
- Title, Message preview, Display Type (banner, modal, notification), Start/End date, Status

**Create Announcement**
- Title
- Full message body (rich text editor)
- Display type: In-app banner (shows at top of client portal), Pop-up modal on login, Notification (goes to notification centre)
- Target audience: All users, specific country, specific account tier, users who haven't made first deposit
- Scheduled start and end date/time

### Page: Email Campaigns

Simple batch email sender:
- Select template or compose custom
- Target audience filter (same as announcements)
- Preview rendering
- Schedule or send immediately
- Track open rates and click rates (via SendGrid webhooks)

---

## 18. MODULE 13 — SYSTEM CONFIGURATION

**Accessible to Super Admin only.**

### General Settings

All settings rendered as a form with labelled inputs. Grouped by category:

**Trading Settings**
- Default leverage (per account tier)
- Margin call level (%)
- Stop-out level (%)
- Max positions per account
- Enable/disable demo accounts

**Financial Settings**
- Minimum deposit amount (per method)
- Minimum withdrawal amount
- Maximum withdrawal per day (per KYC level)
- Withdrawal auto-approval threshold (amounts below this auto-process for verified users)
- Deposit bonus default percentage

**KYC Settings**
- KYC required before deposit: Yes/No
- KYC required before withdrawal: Yes/No
- Allowed document types (checkboxes)
- Accepted countries list / Blocked countries list

**Maintenance Mode**
- Toggle switch: when enabled, shows a maintenance page to all client-facing users. Admin site still accessible.
- Maintenance message text field.

**Fee Configuration**
- Per payment method: deposit fee (%), withdrawal fee (%), flat fee

---

## 19. MODULE 14 — AUDIT TRAIL

**Accessible to Super Admin, Admin, and Compliance.**

### Page: Audit Logs

An immutable record of every significant action taken on the platform.

**Filters:**
- Actor (admin who performed action) — search by name
- Target user
- Action type (dropdown of all action codes)
- Date range
- Severity (Info / Warning / Critical)

**Audit Table**
Columns:
1. Timestamp (exact, with timezone)
2. Actor — Name + role
3. Action — Human-readable description (e.g. "Approved KYC for user john.doe@email.com")
4. Action Code — Technical code (e.g. `kyc.document.approve`)
5. Target User
6. IP Address
7. Severity badge
8. Details button → opens modal showing old_value vs new_value JSON diff

**Key actions that must always appear in audit logs:**
- Every KYC approve/reject
- Every withdrawal approve/reject
- Every account suspension/activation/ban
- Every balance adjustment
- Every instrument enable/disable
- Every admin login and logout
- Every system setting change
- Every force-close of a trade
- Every manual deposit credit
- Every staff account created or permission changed

---

## 20. MODULE 15 — STAFF ACCESS MANAGEMENT

**Accessible to Super Admin only.**

### Page: Staff Members

Table of all admin users:
- Name, Email, Role, Status, Last Login, Created By, Created At, Actions

**Create Staff Account**
- Full name, email, temporary password (auto-generated + forced reset on first login)
- Role assignment (dropdown)
- IP restriction: optional — only allow login from specific IP addresses
- Two-FA required: checkbox (recommended mandatory for all staff)

**Edit Staff**
- Change role
- Reset password
- Enable/disable account
- View that staff member's audit log entries

---

## 21. GLOBAL UI COMPONENTS

These components appear throughout the dashboard and must be built once in a `components/ui/` folder for reuse:

**StatusBadge**
- Props: status string
- Renders appropriate colour badge: Active=green, Pending=amber, Suspended=red, Banned=dark red

**KpiCard**
- Props: title, value, delta, deltaDirection, icon, sparklineData
- Renders the standard metric card used throughout the dashboard

**DataTable**
- Built on TanStack Table
- Props: columns config, data, pagination config, onRowClick, loading state
- Built-in: column sort headers, loading skeleton rows, empty state illustration, pagination controls

**ConfirmDialog**
- Used for any destructive action (suspend, reject, force close)
- Props: title, description, confirmText, onConfirm
- Has a deliberate 1-second delay on the confirm button to prevent accidental clicks

**SideSheet**
- A right-side sliding panel for detail views (KYC review, withdrawal detail, position detail)
- Opens without losing the context of the page behind it

**FilterBar**
- Standardised filter row: search input + status dropdown + date range picker + reset button
- Used consistently at the top of every list/table page

**ExportButton**
- Opens a dropdown: Export as CSV / Export as Excel / Export as PDF
- Shows download progress for large exports

**EmptyState**
- Consistent empty state illustration + message + optional action button
- Appears in tables with no results

**LoadingSkeleton**
- Table row skeletons while data loads (prevents layout shift)

**Toast Notifications** (react-hot-toast)
- Success: green, bottom-right, 4 seconds
- Error: red, bottom-right, 6 seconds, with retry button where applicable
- Info: blue, 4 seconds

**RealTimeBadge**
- Small animated pulsing green dot + "LIVE" text
- Used next to table headers that auto-refresh

---

*End of Admin Dashboard Specification — VertexFX*  
*Version 1.0 — Ready for Development Handoff*
