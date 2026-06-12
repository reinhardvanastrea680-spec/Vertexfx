# VertexFX Broker Platform — Backend & Database Technical Specification

**Document Version:** 1.0  
**Prepared For:** Development Team  
**Project:** VertexFX — Multi-Asset Online Broker Platform  
**Stack:** Node.js · PostgreSQL · Redis · React (Frontend)  
**Classification:** Internal Technical Reference

---

## TABLE OF CONTENTS

1. Project Architecture Overview
2. Technology Stack — Full Breakdown
3. Server & Infrastructure Setup
4. Database Design — All Tables
5. Authentication & Security System
6. User Registration & KYC Flow
7. Trading Engine & Order Management
8. Wallet, Deposits & Withdrawals
9. Payment Gateway Integration
10. Real-Time Data & Market Feeds
11. Compliance, Reporting & AML
12. Notifications System
13. Admin API Layer
14. API Endpoint Reference
15. Environment Variables & Configuration
16. Deployment & DevOps

---

## 1. PROJECT ARCHITECTURE OVERVIEW

The VertexFX platform is built on a **microservices-adjacent monolith** architecture — a single well-structured backend application with clearly separated service modules that can be split into independent microservices later as scale demands. This approach reduces early complexity while preserving future scalability.

### High-Level System Flow

```
Client (React Browser / Mobile App)
        ↓  HTTPS
    Nginx Reverse Proxy  (SSL termination, rate limiting)
        ↓
    Node.js Express API Server  (Port 3001)
        ↓               ↓
  PostgreSQL DB      Redis Cache
  (Primary data)   (Sessions, queues, live prices)
        ↓
  External Services:
    - Payment Gateways (Stripe, Flutterwave, Paystack)
    - Market Data Feed (MetaTrader Bridge / CTrader / FIX Protocol)
    - KYC Provider (Smile Identity / Onfido / Shufti Pro)
    - Email (SendGrid / Nodemailer)
    - SMS (Twilio / Africa's Talking)
    - AWS S3 (Document storage)
```

### Core Modules

- **Auth Module** — JWT + 2FA, session management
- **User Module** — Profile, KYC, document uploads
- **Trading Module** — Orders, positions, P&L calculation
- **Wallet Module** — Balances, deposits, withdrawals, ledger
- **Market Data Module** — Price feeds, instrument catalogue
- **Notification Module** — Email, SMS, in-app alerts
- **Admin Module** — Management APIs for the admin dashboard
- **Compliance Module** — AML screening, reporting, audit logs

---

## 2. TECHNOLOGY STACK — FULL BREAKDOWN

### Backend Runtime
- **Node.js** (v20 LTS) — Primary server runtime
- **Express.js** — REST API framework
- **TypeScript** — Strongly typed codebase to reduce bugs in financial logic

### Primary Database
- **PostgreSQL 15** — All persistent financial and user data
- **Reason:** ACID-compliant transactions are non-negotiable for a financial platform. Every trade, deposit, and withdrawal must either fully succeed or fully roll back — no partial states.

### Cache & Queue Layer
- **Redis 7** — Session storage, real-time price caching, job queues
- **Bull / BullMQ** — Background job processing (withdrawal approvals, KYC checks, report generation)

### ORM
- **Prisma ORM** — Type-safe database access, migration management, readable query syntax

### File Storage
- **AWS S3** (or DigitalOcean Spaces as a cost-effective alternative) — KYC documents, profile photos, trade statements

### Authentication
- **JSON Web Tokens (JWT)** — Access tokens (15-minute expiry) + Refresh tokens (7-day expiry, stored in HttpOnly cookies)
- **bcrypt** — Password hashing (salt rounds: 12)
- **Speakeasy** — TOTP-based two-factor authentication (Google Authenticator compatible)

### Email & SMS
- **SendGrid** — Transactional emails (verification, trade confirmations, withdrawal alerts)
- **Twilio** or **Africa's Talking** — SMS OTP delivery

### Real-Time Communication
- **Socket.io** — WebSocket server for live price feeds, trade notifications, account balance updates

### API Security
- **Helmet.js** — HTTP security headers
- **express-rate-limit** — Rate limiting per IP and per user
- **joi** or **zod** — Input validation on all request bodies
- **express-validator** — Secondary validation layer

### Monitoring & Logging
- **Winston** — Structured application logging
- **Morgan** — HTTP request logging
- **Sentry** — Error tracking and alerting
- **PM2** — Process management and auto-restart in production

---

## 3. SERVER & INFRASTRUCTURE SETUP

### Recommended Production Server Configuration

| Service | Specification | Hosting Option |
|---|---|---|
| API Server | 4 vCPU, 8GB RAM | DigitalOcean Droplet / AWS EC2 |
| PostgreSQL | 4 vCPU, 16GB RAM, 500GB SSD | Managed DB (RDS / DO Managed Postgres) |
| Redis | 2 vCPU, 4GB RAM | Managed Redis (Redis Cloud / Upstash) |
| File Storage | Scalable object store | AWS S3 / DO Spaces |
| Reverse Proxy | Nginx on same server or CDN | Nginx + Cloudflare |

### Directory Structure

```
vertexfx-backend/
├── src/
│   ├── config/           ← Environment config, DB connection
│   ├── modules/
│   │   ├── auth/         ← Login, register, 2FA, JWT
│   │   ├── users/        ← Profile, KYC, documents
│   │   ├── trading/      ← Orders, positions, instruments
│   │   ├── wallet/       ← Balances, deposits, withdrawals
│   │   ├── market/       ← Price feeds, instrument catalogue
│   │   ├── notifications/← Email, SMS, push alerts
│   │   ├── admin/        ← Admin-specific APIs
│   │   └── compliance/   ← AML, audit logs, reports
│   ├── middleware/       ← Auth guards, rate limiters, validators
│   ├── jobs/             ← Bull queue workers
│   ├── utils/            ← Helpers, calculators, formatters
│   ├── prisma/           ← Schema and migrations
│   └── app.ts            ← Express app setup
├── .env
├── .env.production
├── docker-compose.yml
└── package.json
```

---

## 4. DATABASE DESIGN — ALL TABLES

This is the complete relational database schema. Every table listed below must be created via Prisma migrations.

---

### 4.1 USERS Table

Stores all registered trader accounts.

```
Table: users
─────────────────────────────────────────────
id                  UUID (PK, auto-generated)
email               VARCHAR(255) UNIQUE NOT NULL
phone               VARCHAR(30) UNIQUE
password_hash       TEXT NOT NULL
first_name          VARCHAR(100) NOT NULL
last_name           VARCHAR(100) NOT NULL
date_of_birth       DATE
country             VARCHAR(100)
nationality         VARCHAR(100)
address_line1       TEXT
address_line2       TEXT
city                VARCHAR(100)
state               VARCHAR(100)
postal_code         VARCHAR(20)
referral_code       VARCHAR(20) UNIQUE
referred_by         UUID (FK → users.id) NULLABLE
role                ENUM('trader', 'admin', 'super_admin', 'support', 'compliance')
status              ENUM('pending', 'active', 'suspended', 'banned', 'closed')
email_verified      BOOLEAN DEFAULT false
phone_verified      BOOLEAN DEFAULT false
kyc_status          ENUM('not_submitted', 'pending', 'approved', 'rejected')
two_fa_enabled      BOOLEAN DEFAULT false
two_fa_secret       TEXT (encrypted)
last_login_at       TIMESTAMP
last_login_ip       VARCHAR(50)
created_at          TIMESTAMP DEFAULT now()
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE (soft delete)
```

---

### 4.2 KYC_DOCUMENTS Table

Stores identity verification document submissions.

```
Table: kyc_documents
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
document_type       ENUM('national_id', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'selfie')
document_number     VARCHAR(100) NULLABLE
country_of_issue    VARCHAR(100)
expiry_date         DATE NULLABLE
front_image_url     TEXT (S3 URL)
back_image_url      TEXT NULLABLE
selfie_image_url    TEXT NULLABLE
status              ENUM('pending', 'approved', 'rejected')
rejection_reason    TEXT NULLABLE
reviewed_by         UUID (FK → users.id) NULLABLE (admin user)
reviewed_at         TIMESTAMP NULLABLE
provider            VARCHAR(50) (e.g. 'manual', 'onfido', 'smile_identity')
provider_check_id   VARCHAR(200) NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.3 TRADING_ACCOUNTS Table

A single user can have multiple trading accounts (live and demo, different currencies).

```
Table: trading_accounts
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
account_number      VARCHAR(20) UNIQUE (e.g. "VFX-100234")
account_type        ENUM('live', 'demo')
account_tier        ENUM('standard', 'pro', 'raw_ecn')
currency            VARCHAR(10) DEFAULT 'USD'
leverage            INTEGER DEFAULT 200 (e.g. 200 = 1:200)
balance             DECIMAL(20,8) DEFAULT 0
equity              DECIMAL(20,8) DEFAULT 0 (balance + floating P&L)
margin              DECIMAL(20,8) DEFAULT 0 (used margin)
free_margin         DECIMAL(20,8) DEFAULT 0
margin_level        DECIMAL(10,2) DEFAULT 0 (equity / margin * 100)
status              ENUM('active', 'suspended', 'closed')
platform            ENUM('mt4', 'mt5', 'webtrader', 'internal')
platform_account_id VARCHAR(100) NULLABLE (MT4/MT5 account ID)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.4 INSTRUMENTS Table

The full catalogue of tradeable assets.

```
Table: instruments
─────────────────────────────────────────────
id                  UUID (PK)
symbol              VARCHAR(20) UNIQUE (e.g. "EURUSD", "BTCUSD")
display_name        VARCHAR(100)
category            ENUM('forex', 'crypto', 'stocks', 'commodities', 'indices', 'etfs')
base_currency       VARCHAR(10)
quote_currency      VARCHAR(10)
contract_size       DECIMAL(20,8) DEFAULT 100000 (1 lot size)
pip_size            DECIMAL(20,10) (e.g. 0.0001 for EURUSD)
min_lot             DECIMAL(10,5) DEFAULT 0.01
max_lot             DECIMAL(10,2) DEFAULT 100
lot_step            DECIMAL(10,5) DEFAULT 0.01
spread              DECIMAL(10,5) (fixed spread, 0 for variable)
commission_per_lot  DECIMAL(10,5) DEFAULT 0
swap_long           DECIMAL(10,6) (overnight swap rate for long positions)
swap_short          DECIMAL(10,6)
margin_percent      DECIMAL(10,4) (e.g. 0.5 = 0.5% margin requirement)
is_active           BOOLEAN DEFAULT true
trading_hours       JSONB (e.g. {"mon":"00:00-23:59", "sat":"closed"})
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.5 ORDERS Table

Every order placed on the platform — including pending, filled, and cancelled.

```
Table: orders
─────────────────────────────────────────────
id                  UUID (PK)
account_id          UUID (FK → trading_accounts.id)
user_id             UUID (FK → users.id)
instrument_id       UUID (FK → instruments.id)
symbol              VARCHAR(20) (denormalized for speed)
order_type          ENUM('market', 'limit', 'stop', 'stop_limit')
direction           ENUM('buy', 'sell')
volume              DECIMAL(10,5) (lots)
open_price          DECIMAL(20,8) NULLABLE (set on execution)
requested_price     DECIMAL(20,8) (price at time of order)
stop_loss           DECIMAL(20,8) NULLABLE
take_profit         DECIMAL(20,8) NULLABLE
status              ENUM('pending', 'open', 'closed', 'cancelled', 'rejected')
open_time           TIMESTAMP NULLABLE
close_time          TIMESTAMP NULLABLE
close_price         DECIMAL(20,8) NULLABLE
profit_loss         DECIMAL(20,8) DEFAULT 0
commission          DECIMAL(20,8) DEFAULT 0
swap                DECIMAL(20,8) DEFAULT 0
comment             TEXT NULLABLE
magic_number        INTEGER NULLABLE (for EA/algo orders)
ticket_number       VARCHAR(30) UNIQUE (human-readable reference)
ip_address          VARCHAR(50)
platform            ENUM('mt4', 'mt5', 'webtrader', 'api')
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.6 POSITIONS Table

Currently open positions (a filled order that has not been closed).

```
Table: positions
─────────────────────────────────────────────
id                  UUID (PK)
order_id            UUID (FK → orders.id)
account_id          UUID (FK → trading_accounts.id)
user_id             UUID (FK → users.id)
symbol              VARCHAR(20)
direction           ENUM('buy', 'sell')
volume              DECIMAL(10,5)
open_price          DECIMAL(20,8)
current_price       DECIMAL(20,8) (updated every tick)
stop_loss           DECIMAL(20,8) NULLABLE
take_profit         DECIMAL(20,8) NULLABLE
floating_pnl        DECIMAL(20,8) (unrealised P&L)
swap_accumulated    DECIMAL(20,8) DEFAULT 0
margin_used         DECIMAL(20,8)
open_time           TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.7 WALLET_ACCOUNTS Table

The financial wallet tied to each user (separate from trading accounts).

```
Table: wallet_accounts
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id) UNIQUE
currency            VARCHAR(10) DEFAULT 'USD'
balance             DECIMAL(20,8) DEFAULT 0
locked_balance      DECIMAL(20,8) DEFAULT 0 (funds pending withdrawal)
total_deposited     DECIMAL(20,8) DEFAULT 0
total_withdrawn     DECIMAL(20,8) DEFAULT 0
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.8 TRANSACTIONS Table

Every financial movement — deposits, withdrawals, internal transfers, bonuses.

```
Table: transactions
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
wallet_id           UUID (FK → wallet_accounts.id)
type                ENUM('deposit', 'withdrawal', 'internal_transfer', 'bonus', 'commission', 'adjustment', 'refund')
direction           ENUM('credit', 'debit')
amount              DECIMAL(20,8) NOT NULL
currency            VARCHAR(10)
status              ENUM('pending', 'processing', 'completed', 'failed', 'reversed', 'cancelled')
payment_method      ENUM('card', 'bank_transfer', 'crypto', 'flutterwave', 'paystack', 'usdt', 'internal')
payment_reference   VARCHAR(200) NULLABLE (gateway reference)
gateway_response    JSONB NULLABLE (full response from payment provider)
exchange_rate       DECIMAL(20,8) NULLABLE (if currency conversion occurred)
fee                 DECIMAL(20,8) DEFAULT 0
net_amount          DECIMAL(20,8) (amount - fee)
balance_before      DECIMAL(20,8)
balance_after       DECIMAL(20,8)
description         TEXT NULLABLE
processed_by        UUID NULLABLE (admin who approved a manual withdrawal)
processed_at        TIMESTAMP NULLABLE
ip_address          VARCHAR(50)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.9 BANK_ACCOUNTS Table

User-submitted bank account details for withdrawals.

```
Table: bank_accounts
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
account_name        VARCHAR(200)
bank_name           VARCHAR(200)
account_number      VARCHAR(50)
routing_number      VARCHAR(50) NULLABLE (US)
sort_code           VARCHAR(20) NULLABLE (UK)
iban                VARCHAR(50) NULLABLE
swift_bic           VARCHAR(20) NULLABLE
country             VARCHAR(100)
currency            VARCHAR(10)
is_verified         BOOLEAN DEFAULT false
is_primary          BOOLEAN DEFAULT false
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

### 4.10 PRICE_TICKS Table (Time-Series)

Stores historical tick data for charts and auditing. This table grows extremely fast — partition by month or use TimescaleDB.

```
Table: price_ticks
─────────────────────────────────────────────
id                  BIGSERIAL (PK)
symbol              VARCHAR(20)
bid                 DECIMAL(20,8)
ask                 DECIMAL(20,8)
mid                 DECIMAL(20,8) (computed: (bid+ask)/2)
volume              DECIMAL(20,8) NULLABLE
timestamp           TIMESTAMP WITH TIME ZONE NOT NULL
source              VARCHAR(50) (e.g. 'mt5_bridge', 'binance', 'oanda')

INDEX ON (symbol, timestamp DESC)
PARTITION BY RANGE (timestamp)
```

---

### 4.11 OHLCV_CANDLES Table

Pre-aggregated OHLCV (Open/High/Low/Close/Volume) candle data for charts.

```
Table: ohlcv_candles
─────────────────────────────────────────────
id                  BIGSERIAL (PK)
symbol              VARCHAR(20)
timeframe           ENUM('M1','M5','M15','M30','H1','H4','D1','W1','MN')
open                DECIMAL(20,8)
high                DECIMAL(20,8)
low                 DECIMAL(20,8)
close               DECIMAL(20,8)
volume              DECIMAL(20,8)
candle_time         TIMESTAMP (start of the candle period)
created_at          TIMESTAMP

UNIQUE INDEX ON (symbol, timeframe, candle_time)
```

---

### 4.12 AUDIT_LOGS Table

Immutable record of every admin action and sensitive user action. This is your compliance backbone.

```
Table: audit_logs
─────────────────────────────────────────────
id                  UUID (PK)
actor_id            UUID (FK → users.id) (who did it)
target_user_id      UUID NULLABLE (who was affected)
action              VARCHAR(100) (e.g. 'user.kyc.approve', 'withdrawal.approve', 'account.suspend')
entity_type         VARCHAR(50) (e.g. 'user', 'transaction', 'order')
entity_id           UUID NULLABLE
old_value           JSONB NULLABLE (state before change)
new_value           JSONB NULLABLE (state after change)
ip_address          VARCHAR(50)
user_agent          TEXT
module              VARCHAR(50)
severity            ENUM('info', 'warning', 'critical')
created_at          TIMESTAMP DEFAULT now()

NOTE: This table is INSERT-ONLY. No UPDATE or DELETE ever.
```

---

### 4.13 NOTIFICATIONS Table

```
Table: notifications
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
type                ENUM('trade_opened', 'trade_closed', 'deposit_received', 'withdrawal_approved', 'withdrawal_rejected', 'kyc_approved', 'kyc_rejected', 'margin_call', 'stop_out', 'system_alert', 'login_alert', 'bonus_credited')
title               VARCHAR(200)
body                TEXT
is_read             BOOLEAN DEFAULT false
read_at             TIMESTAMP NULLABLE
channel             ENUM('in_app', 'email', 'sms', 'push')
metadata            JSONB NULLABLE (e.g. trade ticket, transaction id)
created_at          TIMESTAMP
```

---

### 4.14 BONUSES Table

```
Table: bonuses
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
account_id          UUID (FK → trading_accounts.id)
bonus_type          ENUM('welcome', 'deposit_match', 'referral', 'loyalty', 'promotional')
amount              DECIMAL(20,8)
currency            VARCHAR(10)
status              ENUM('pending', 'active', 'withdrawn', 'forfeited', 'expired')
wagering_requirement DECIMAL(20,8) (lots required to unlock withdrawal)
wagering_completed   DECIMAL(20,8) DEFAULT 0
expiry_date          DATE NULLABLE
awarded_by           UUID NULLABLE (admin)
created_at           TIMESTAMP
updated_at           TIMESTAMP
```

---

### 4.15 REFERRALS Table

```
Table: referrals
─────────────────────────────────────────────
id                  UUID (PK)
referrer_id         UUID (FK → users.id)
referred_id         UUID (FK → users.id) UNIQUE
status              ENUM('pending', 'qualified', 'rewarded')
commission_earned   DECIMAL(20,8) DEFAULT 0
first_deposit_date  DATE NULLABLE
qualified_at        TIMESTAMP NULLABLE
created_at          TIMESTAMP
```

---

### 4.16 SESSIONS Table

```
Table: sessions
─────────────────────────────────────────────
id                  UUID (PK)
user_id             UUID (FK → users.id)
refresh_token_hash  TEXT
ip_address          VARCHAR(50)
user_agent          TEXT
device_type         ENUM('web', 'ios', 'android', 'api')
is_revoked          BOOLEAN DEFAULT false
expires_at          TIMESTAMP
created_at          TIMESTAMP
last_used_at        TIMESTAMP
```

---

### 4.17 SYSTEM_SETTINGS Table

```
Table: system_settings
─────────────────────────────────────────────
id                  UUID (PK)
key                 VARCHAR(100) UNIQUE
value               TEXT
value_type          ENUM('string', 'number', 'boolean', 'json')
description         TEXT
updated_by          UUID (FK → users.id)
updated_at          TIMESTAMP

Examples of keys:
  'maintenance_mode' → 'false'
  'max_withdrawal_per_day' → '10000'
  'kyc_required_for_withdrawal' → 'true'
  'default_leverage' → '200'
  'margin_call_level' → '100'
  'stop_out_level' → '50'
```

---

## 5. AUTHENTICATION & SECURITY SYSTEM

### Registration Flow

1. User submits: email, password, first name, last name, country, phone
2. Server validates all fields with zod schema
3. Password hashed with bcrypt (12 rounds)
4. User record created with `status: 'pending'`, `email_verified: false`
5. Wallet account auto-created for the user
6. Verification email sent via SendGrid with a signed JWT token (expires in 24 hours)
7. User clicks link → `email_verified` set to true, `status` set to `'active'`
8. Welcome email sent

### Login Flow

1. User submits email + password
2. User record looked up by email
3. bcrypt.compare() called to verify password
4. If `two_fa_enabled = true` → return `{ requiresTwoFA: true, tempToken: "..." }` (short-lived)
5. Client prompts for TOTP code
6. Server verifies TOTP code using speakeasy
7. On success: generate access token (15 min) + refresh token (7 days)
8. Refresh token stored hashed in `sessions` table
9. Refresh token sent as HttpOnly Secure SameSite=Strict cookie
10. Access token returned in response body
11. `last_login_at` and `last_login_ip` updated in users table
12. Login notification sent via email

### Token Refresh Flow

1. Client sends request to `POST /auth/refresh` with refresh token cookie
2. Server decodes token, looks up session by hashed token
3. Checks session not revoked, not expired
4. Issues new access token
5. Optionally rotates refresh token (recommended for high security)

### Password Reset Flow

1. User submits email to `POST /auth/forgot-password`
2. Server looks up user, generates signed reset token (JWT, 1-hour expiry)
3. Email sent with reset link
4. User submits new password + token to `POST /auth/reset-password`
5. Token validated, password updated, all existing sessions revoked

### 2FA Setup

1. User enables 2FA in settings
2. Server generates TOTP secret via speakeasy
3. QR code URI returned to client (renders as QR for Google Authenticator)
4. User scans QR and submits first code to confirm setup
5. Secret encrypted and stored in `users.two_fa_secret`
6. Backup codes generated, hashed, stored — returned once to user

### Security Middleware Stack

Every protected route passes through this middleware chain in order:

```
Request → rateLimiter → authenticate → authorizeRole → validateBody → handler
```

- `rateLimiter`: Per-IP and per-user request throttling (e.g. max 100 requests/15min for general, 5 attempts/15min for login)
- `authenticate`: Verifies JWT access token from Authorization header
- `authorizeRole`: Checks `users.role` against required role for the endpoint
- `validateBody`: Zod/Joi schema validation of request body

---

## 6. USER REGISTRATION & KYC FLOW

### KYC Verification Levels

| Level | Verification Required | Deposit Limit | Withdrawal Limit |
|---|---|---|---|
| Level 0 | Email verified only | $0 | $0 |
| Level 1 | Email + Phone + National ID | $10,000/month | $5,000/month |
| Level 2 | Level 1 + Proof of Address | $50,000/month | $25,000/month |
| Level 3 | Level 2 + Selfie + Enhanced check | Unlimited | Unlimited |

### KYC Document Submission Flow

1. User uploads documents via the frontend (supports JPG, PNG, PDF, max 10MB)
2. Files uploaded directly to AWS S3 via pre-signed URLs (server generates URL, client uploads directly — never passes through your server)
3. S3 URLs stored in `kyc_documents` table with `status: 'pending'`
4. Admin notified of new KYC submission
5. Admin reviews in admin dashboard
6. If approved: `kyc_documents.status` → `'approved'`, user's `kyc_status` → `'approved'`
7. If rejected: admin fills rejection reason, user notified with reason and asked to resubmit
8. KYC approval email sent to user

### Automated KYC (Optional — Phase 2)

Integrate with **Smile Identity** (strong Africa coverage) or **Onfido** to automate document checks:
- Document authenticity check
- Facial biometric comparison (selfie vs ID photo)
- PEP (Politically Exposed Persons) and sanctions screening
- Results returned via webhook, stored in `kyc_documents.provider_check_id`

---

## 7. TRADING ENGINE & ORDER MANAGEMENT

### Order Lifecycle

```
Order Submitted → Validated → Price Checked → Margin Checked → Executed → Position Created → Monitored → Closed
```

### Step-by-Step Order Processing

**Step 1: Receive Order Request**
Client sends: `{ accountId, symbol, direction, volume, orderType, stopLoss, takePrifit }`

**Step 2: Validation**
- Account exists and is active
- Instrument is active and within trading hours
- Volume within min/max lot range
- Stop loss and take profit are logical (SL below price for buy, above for sell)

**Step 3: Margin Check**
```
Required Margin = (Volume × Contract Size × Current Price) / Leverage

Example: 0.1 lot EURUSD at 1.0850, 1:200 leverage
= (0.1 × 100,000 × 1.0850) / 200
= $54.25 required margin

If account.free_margin >= required_margin → proceed
Else → reject with INSUFFICIENT_MARGIN error
```

**Step 4: Execute Order**
- For market orders: use current bid (sell) or ask (buy) from Redis price cache
- Create `orders` record with `status: 'open'`
- Create `positions` record
- Deduct margin from account: `margin += required_margin`, `free_margin -= required_margin`

**Step 5: Real-Time Position Monitoring**
A background worker (running every 500ms) loops through all open positions:
- Fetches latest price from Redis
- Recalculates `floating_pnl` for each position
- Updates account `equity` = `balance + sum(floating_pnl)`
- Recalculates `margin_level` = `equity / margin * 100`
- Checks margin call level (default: 100%) → sends notification
- Checks stop-out level (default: 50%) → auto-closes positions from largest loss first
- Checks if stop loss or take profit price has been hit → closes position

**Step 6: Close Position**
- P&L calculation:
  ```
  For Buy: P&L = (close_price - open_price) × volume × contract_size
  For Sell: P&L = (open_price - close_price) × volume × contract_size
  ```
- Commission charged: `commission = volume × commission_per_lot`
- Swap charged if position held overnight
- `balance += P&L - commission - swap`
- `margin -= required_margin`
- Order status set to `'closed'`
- Position deleted from `positions` table
- Trade confirmation notification sent to user

### Swap Calculation

Applied daily at server rollover time (typically 22:00 GMT):
```
Daily Swap = volume × contract_size × (swap_rate / 100) / 360
```
On Wednesdays, triple swap is charged (to account for the weekend settlement).

---

## 8. WALLET, DEPOSITS & WITHDRAWALS

### Deposit Flow

1. User selects amount and payment method
2. Server creates a `transactions` record with `status: 'pending'`
3. Server calls payment gateway API to initiate payment
4. Gateway returns payment URL / checkout session
5. User completes payment on gateway page
6. Gateway sends webhook to `POST /webhooks/[provider]`
7. Server validates webhook signature (CRITICAL — verify every webhook)
8. Transaction status updated to `'completed'`
9. User's wallet balance credited: `balance += net_amount`
10. If first deposit → trigger welcome bonus check, referral commission check
11. Deposit confirmation email/SMS sent to user

### Withdrawal Flow

1. User submits withdrawal request (amount, bank account, reason optional)
2. Validation:
   - KYC level sufficient
   - Balance >= amount + fee
   - No active margin positions that would breach minimum margin
   - Within daily/monthly limits
   - Bank account verified
3. `transactions` record created with `status: 'pending'`
4. `wallet.locked_balance += amount` (funds reserved, prevent double spending)
5. Admin notified of pending withdrawal request
6. Admin reviews in dashboard (or auto-approved if under threshold, e.g. <$500 for verified users)
7. **If approved:** payment sent via gateway / manual bank transfer. Status → `'completed'`. `balance -= amount`, `locked_balance -= amount`
8. **If rejected:** `locked_balance -= amount` (funds returned to available balance). Rejection reason sent to user.

### Transaction Fee Structure

Define fees in `system_settings` or a dedicated `fee_tiers` table:
- Card deposits: 0% (absorbed by broker)
- Crypto deposits: 0%
- Bank wire withdrawal: $25 fixed or 1% (whichever is greater)
- Minimum withdrawal: $50

---

## 9. PAYMENT GATEWAY INTEGRATION

### Recommended Gateways

| Gateway | Best For | Integration Type |
|---|---|---|
| **Stripe** | International card payments | Official SDK |
| **Flutterwave** | African markets (NGN, GHS, KES) | REST API |
| **Paystack** | Nigeria specifically | Official SDK |
| **CoinPayments / BTCPay** | Crypto deposits (BTC, ETH, USDT) | Webhook-based |
| **Bank Transfer** | Manual wire — admin confirms | Manual approval flow |

### Webhook Security

Every gateway webhook endpoint MUST:
1. Verify the signature header (each gateway provides an HMAC signature in request headers)
2. Return HTTP 200 immediately to acknowledge receipt
3. Process the event asynchronously (push to a Bull queue, process in background worker)
4. Be idempotent — if the same webhook is received twice, it should not credit twice. Check if transaction already `'completed'` before processing.

```javascript
// Example webhook validation pattern (Stripe)
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
// If constructEvent throws → reject (signature invalid)
```

---

## 10. REAL-TIME DATA & MARKET FEEDS

### Price Feed Architecture

```
External Price Source (MT5 Bridge / FIX / REST API)
        ↓
    Price Ingestion Service (Node.js worker)
        ↓
    Redis Pub/Sub Channel: "prices:[SYMBOL]"
        ↓
    Socket.io Server subscribes and broadcasts to connected clients
        ↓
    React Client receives tick via WebSocket
```

### Price Sources Options

- **MetaTrader 5 Bridge** — If you're using MT5, prices flow through the bridge
- **cTrader FIX Protocol** — Professional FIX API (requires liquidity provider relationship)
- **Third-party REST/WebSocket APIs** — Oanda for forex, CoinGecko/Binance for crypto, Polygon.io for stocks

### WebSocket Events (Socket.io)

Client subscribes to specific channels after authenticating the socket connection:

| Event | Direction | Payload |
|---|---|---|
| `subscribe:price` | Client → Server | `{ symbol: "EURUSD" }` |
| `price:tick` | Server → Client | `{ symbol, bid, ask, timestamp }` |
| `account:update` | Server → Client | `{ balance, equity, margin, freeMargin }` |
| `position:update` | Server → Client | `{ positionId, floatingPnl, currentPrice }` |
| `notification:new` | Server → Client | `{ id, type, title, body }` |
| `trade:closed` | Server → Client | `{ ticket, symbol, pnl }` |

### Redis Price Cache

Latest prices stored in Redis as hash maps for O(1) retrieval:
```
Key: price:EURUSD
Value: { bid: 1.0847, ask: 1.0849, timestamp: 1718123456789 }
TTL: 5 seconds (stale if not updated by feed)
```

---

## 11. COMPLIANCE, REPORTING & AML

### AML (Anti-Money Laundering) Checks

Every deposit and withdrawal must be screened:

1. **Transaction Monitoring Rules** — Configurable rules stored in a `aml_rules` table:
   - Flag deposits > $10,000 (customize per jurisdiction)
   - Flag multiple small deposits in 24 hours totalling > $5,000 (structuring pattern)
   - Flag withdrawal to a new bank account within 24 hours of deposit (layering pattern)
   - Flag deposits from sanctioned countries
2. Flagged transactions trigger an `aml_alerts` record and notify the compliance team
3. Compliance officer reviews, either clears the flag or files a Suspicious Activity Report (SAR)
4. If cleared: transaction proceeds. If escalated: account suspended pending investigation.

### Required Regulatory Reports (depends on your license jurisdiction)

- **Transaction reports** — Monthly export of all deposits/withdrawals with client details
- **Trade reports** — All executed trades with timestamps, instruments, volumes, prices
- **Client asset reports** — Segregated fund balance reconciliation
- **KYC audit reports** — All KYC verifications with document types and outcomes

### Data Retention Policy

Per most financial regulations:
- User records: 7 years after account closure
- Transaction records: 7 years
- Audit logs: 7 years (immutable)
- Price tick data: 5 years minimum

Implement automatic archival to cold storage (AWS S3 Glacier) after 2 years.

---

## 12. NOTIFICATIONS SYSTEM

### Notification Service Architecture

1. Any part of the system dispatches a notification event to a Bull queue
2. The notification worker picks up the job and determines channels (in-app, email, SMS)
3. For in-app: inserts into `notifications` table, emits via Socket.io
4. For email: calls SendGrid API
5. For SMS: calls Twilio / Africa's Talking API

### Notification Template Library

Templates stored in the database or as code templates. Must exist for:
- Email verification
- Password reset
- Login from new device
- Deposit confirmed
- Withdrawal approved
- Withdrawal rejected
- KYC approved
- KYC rejected
- KYC documents resubmission required
- Trade opened confirmation
- Trade closed confirmation with P&L
- Margin call warning
- Stop-out warning (urgent)
- Account suspended
- Bonus credited
- Referral commission earned

### User Notification Preferences

Users can toggle each channel per notification type. Store as JSONB in `users` table or a separate `notification_preferences` table.

---

## 13. ADMIN API LAYER

The admin dashboard communicates with the backend via a separate set of protected API routes, all behind `authorizeRole(['admin', 'super_admin'])` middleware.

### Admin-Specific Endpoints Overview

```
GET    /admin/dashboard/stats          → Overview KPIs
GET    /admin/users                    → Paginated user list with filters
GET    /admin/users/:id                → Full user profile
PATCH  /admin/users/:id/status         → Suspend / activate / ban user
GET    /admin/users/:id/trades         → User trade history
GET    /admin/users/:id/transactions   → User financial history

GET    /admin/kyc/pending              → KYC submissions awaiting review
POST   /admin/kyc/:id/approve          → Approve KYC
POST   /admin/kyc/:id/reject           → Reject KYC with reason

GET    /admin/withdrawals/pending      → Withdrawal requests queue
POST   /admin/withdrawals/:id/approve  → Approve and process withdrawal
POST   /admin/withdrawals/:id/reject   → Reject withdrawal with reason

GET    /admin/trades                   → All trades across all accounts
GET    /admin/positions/open           → All currently open positions
POST   /admin/positions/:id/close      → Force-close a position

GET    /admin/reports/financial        → P&L, revenue, volume report
GET    /admin/reports/trading          → Trading activity report
GET    /admin/reports/clients          → Client growth report

GET    /admin/audit-logs               → Full audit trail
GET    /admin/aml-alerts               → AML flagged transactions

POST   /admin/announcements            → Create system announcement
PATCH  /admin/settings/:key            → Update system settings

GET    /admin/instruments              → Instrument catalogue
POST   /admin/instruments              → Add new instrument
PATCH  /admin/instruments/:id          → Update instrument (spread, status)
```

---

## 14. API ENDPOINT REFERENCE (USER-FACING)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email/:token
POST   /auth/2fa/setup
POST   /auth/2fa/verify
DELETE /auth/2fa/disable

GET    /users/me
PATCH  /users/me
POST   /users/me/kyc
GET    /users/me/kyc
GET    /users/me/documents
GET    /users/me/notifications
PATCH  /users/me/notifications/:id/read

GET    /accounts
POST   /accounts (create new trading account)
GET    /accounts/:id
GET    /accounts/:id/trades
GET    /accounts/:id/positions

POST   /orders
GET    /orders
GET    /orders/:id
DELETE /orders/:id (cancel pending order)
POST   /positions/:id/close
POST   /positions/:id/modify (update SL/TP)

GET    /market/instruments
GET    /market/instruments/:symbol
GET    /market/instruments/:symbol/candles?timeframe=H1&from=&to=
GET    /market/instruments/:symbol/price (latest tick)

GET    /wallet
POST   /wallet/deposit
POST   /wallet/withdraw
GET    /wallet/transactions
GET    /wallet/transactions/:id
GET    /wallet/bank-accounts
POST   /wallet/bank-accounts
DELETE /wallet/bank-accounts/:id
```

---

## 15. ENVIRONMENT VARIABLES & CONFIGURATION

Create a `.env` file (never commit to version control). Use `.env.example` for documentation.

```
# Server
NODE_ENV=production
PORT=3001
APP_URL=https://api.vertexfx.com

# Database
DATABASE_URL=postgresql://username:password@host:5432/vertexfx_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://username:password@host:6379

# JWT
JWT_ACCESS_SECRET=<256-bit-random-string>
JWT_REFRESH_SECRET=<different-256-bit-random-string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=vertexfx-kyc-documents
AWS_S3_REGION=us-east-1

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@vertexfx.com

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Flutterwave
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=

# KYC Provider
ONFIDO_API_TOKEN=
SMILE_IDENTITY_API_KEY=
SMILE_IDENTITY_PARTNER_ID=

# Encryption (for 2FA secrets, sensitive fields)
ENCRYPTION_KEY=<32-byte-hex-key>

# Sentry
SENTRY_DSN=
```

---

## 16. DEPLOYMENT & DEVOPS

### Recommended Deployment Process

**Phase 1 — Development**
- Local: Docker Compose (Postgres + Redis + Node)
- Git branch: `develop`

**Phase 2 — Staging**
- Deploy to a staging server (identical to production)
- Run integration tests
- Git branch: `staging`

**Phase 3 — Production**
- Zero-downtime deployment via PM2 cluster mode
- Git branch: `main` (only merge after staging approval)

### Docker Compose (Development)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vertexfx_dev
      POSTGRES_USER: vertexfx
      POSTGRES_PASSWORD: devpassword
    ports: ["5432:5432"]
    volumes: ["pg_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: .
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://vertexfx:devpassword@postgres:5432/vertexfx_dev
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]

volumes:
  pg_data:
```

### Database Migration Strategy

```bash
# Create a new migration
npx prisma migrate dev --name add_bonus_table

# Apply migrations on production
npx prisma migrate deploy

# Never use prisma db push in production — always use migrations
```

### Security Checklist Before Launch

- [ ] All API endpoints require authentication (audit every route)
- [ ] Webhook signatures validated on all payment endpoints
- [ ] Rate limiting applied to auth routes (login, register, password reset)
- [ ] SQL injection not possible (Prisma ORM parameterises all queries)
- [ ] Sensitive data (2FA secrets) encrypted at rest (AES-256)
- [ ] HTTPS enforced, HSTS header set
- [ ] CORS configured to allow only your frontend domain
- [ ] Admin routes require `admin` role — confirmed in middleware
- [ ] S3 bucket is private — only accessible via pre-signed URLs
- [ ] `.env` never committed to Git (in `.gitignore`)
- [ ] Passwords never logged
- [ ] No sensitive data in query strings (use request body)
- [ ] Database not exposed to public internet (VPC / private network only)
- [ ] Daily automated database backups configured with 30-day retention
- [ ] Error responses never reveal stack traces in production

---

*End of Backend & Database Specification — VertexFX*  
*Next Document: Admin Dashboard Specification*
