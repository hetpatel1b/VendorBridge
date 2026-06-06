# VendorBridge — Backend Architecture & Team Plan

> **4-Member Team | Hackathon Build | Modular Monolith**

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Node.js 20+ | Fast I/O, JS full-stack synergy |
| **Framework** | Express.js | Lightweight, flexible, hackathon-fast |
| **Database** | PostgreSQL 16 | Relational data, perfect for procurement |
| **ORM** | Prisma | Type-safe, auto-migrations, great DX |
| **Auth** | JWT (access + refresh) | Stateless, scalable |
| **Validation** | Zod | Runtime schema validation |
| **Cache** | Redis (optional) | Notifications, session blacklist |
| **PDF** | PDFKit / Puppeteer | PO export |
| **Testing** | Jest + Supertest | Unit + integration |
| **Docs** | Swagger (swagger-jsdoc) | Auto API docs |

---

## 2. Folder Structure

```
vendorbridge-backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Entry point
│   ├── config/
│   │   ├── index.ts           # Env vars
│   │   ├── database.ts        # Prisma client singleton
│   │   └── cors.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── rbac.ts            # Role/permission guard
│   │   ├── validate.ts        # Zod validator
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── auditLogger.ts     # Auto audit-log
│   ├── modules/               # ⭐ MODULAR ARCHITECTURE
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.schema.ts
│   │   ├── vendors/
│   │   │   ├── vendors.routes.ts
│   │   │   ├── vendors.controller.ts
│   │   │   ├── vendors.service.ts
│   │   │   └── vendors.schema.ts
│   │   ├── rfqs/
│   │   │   ├── rfqs.routes.ts
│   │   │   ├── rfqs.controller.ts
│   │   │   ├── rfqs.service.ts
│   │   │   └── rfqs.schema.ts
│   │   ├── quotations/
│   │   │   ├── quotations.routes.ts
│   │   │   ├── quotations.controller.ts
│   │   │   ├── quotations.service.ts
│   │   │   ├── comparison.service.ts  # ⭐ Star feature
│   │   │   └── quotations.schema.ts
│   │   ├── approvals/
│   │   │   ├── approvals.routes.ts
│   │   │   ├── approvals.controller.ts
│   │   │   ├── approvals.service.ts
│   │   │   ├── escalation.service.ts
│   │   │   └── approvals.schema.ts
│   │   ├── purchase-orders/
│   │   │   ├── po.routes.ts
│   │   │   ├── po.controller.ts
│   │   │   ├── po.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── po.schema.ts
│   │   ├── invoices/
│   │   │   ├── invoices.routes.ts
│   │   │   ├── invoices.controller.ts
│   │   │   ├── invoices.service.ts
│   │   │   ├── matching.service.ts
│   │   │   └── invoices.schema.ts
│   │   ├── notifications/
│   │   │   └── ...
│   │   ├── analytics/
│   │   │   └── ...
│   │   └── audit/
│   │       └── ...
│   ├── utils/
│   │   ├── response.ts
│   │   ├── pagination.ts
│   │   ├── idGenerator.ts
│   │   └── stateMachine.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 3. Module Dependency Graph

```mermaid
graph TB
    AUTH[Auth] --> USR[Users]
    USR --> VND[Vendors]
    VND --> RFQ[RFQs]
    RFQ --> QOT[Quotations]
    QOT --> PO[Purchase Orders]
    PO --> INV[Invoices]
    PO --> APR[Approvals]
    NTF[Notifications] -.-> RFQ
    NTF -.-> APR
    NTF -.-> PO
    AUD[Audit Log] -.->|middleware| ALL[All Modules]
    ANL[Analytics] -.->|reads from| ALL
```

---

## 4. Request Flow

```
Client → Rate Limiter → CORS/Helmet → JWT Auth → RBAC Guard
       → Zod Validator → Controller → Service → DB
       → Audit Logger (async) → Standard JSON Response
```

---

## 5. Key Patterns

**State Machine** — Every entity with lifecycle uses validated transitions:
```typescript
const rfqStates = {
  draft:      ['sent', 'cancelled'],
  sent:       ['open', 'cancelled'],
  open:       ['closed', 'cancelled'],
  closed:     ['evaluation'],
  evaluation: ['awarded'],
};
```

**Standard Response**:
```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 150 } }
```

**RBAC Middleware**:
```typescript
router.post('/rfqs', auth(), rbac('rfq','create'), validate(schema), controller.create);
```

---

## 6. Team Roles (4 Friends)

### 🟣 Member 1 — Backend Lead & Auth Architect
> **Owns**: Foundation, Auth, Users, RBAC, Middleware, Audit, Seed Data

| Task | Hours | Priority |
|---|---|---|
| Project setup (Express, Prisma, TS, Docker) | 2h | P0 |
| Database schema (all tables) | 2h | P0 |
| Auth module (register, login, JWT, refresh) | 2h | P0 |
| RBAC middleware + permission seeding | 2h | P0 |
| Global middleware (error, rate limit, audit) | 2h | P0 |
| Seed data script (realistic demo data) | 2h | P1 |
| Notification module | 2h | P1 |
| Swagger API docs | 1h | P2 |

**Deliverable**: Working auth + protected routes by **Hour 6**

---

### 🟢 Member 2 — Core Procurement Engineer
> **Owns**: Vendors, RFQs, Quotations, ⭐ Comparison Engine

| Task | Hours | Priority |
|---|---|---|
| Vendor module (CRUD, status, categories) | 3h | P0 |
| RFQ module (CRUD, items, vendors, lifecycle) | 3h | P0 |
| Quotation module (submit, validate, list) | 2h | P0 |
| ⭐ Comparison Engine (ranking, scoring) | 3h | P0 |
| Vendor Performance Index (VPI) | 2h | P1 |
| Vendor rating system | 1h | P1 |

**Deliverable**: Full RFQ→Quotation→Compare flow by **Hour 18**

---

### 🟡 Member 3 — Workflow & Orders Engineer
> **Owns**: Approvals, Purchase Orders, Invoices, 3-Way Matching

| Task | Hours | Priority |
|---|---|---|
| Approval rules engine | 2h | P0 |
| Approval workflow (route, approve, reject) | 3h | P0 |
| Purchase Order module (from quotation) | 3h | P0 |
| PO PDF generation | 1h | P1 |
| Invoice module (CRUD, tracking) | 2h | P1 |
| 3-Way Matching (PO↔GRN↔Invoice) | 2h | P2 |
| Auto-escalation | 1h | P2 |

**Deliverable**: Full Approval + PO flow by **Hour 24**

---

### 🔵 Member 4 — Frontend Lead & Analytics
> **Owns**: Entire Frontend, Analytics API, Dashboard

| Task | Hours | Priority |
|---|---|---|
| Frontend setup (Next.js/Vite, layout) | 2h | P0 |
| Login page (glassmorphism, split-screen) | 1h | P0 |
| Dashboard (KPI cards, charts) | 3h | P0 |
| Vendor management screens | 2h | P0 |
| RFQ screens (list, wizard, detail) | 3h | P0 |
| ⭐ Quotation comparison UI | 3h | P0 |
| Approval queue UI (context cards) | 2h | P0 |
| Analytics API + charts | 4h | P1 |
| PO & Invoice screens | 2h | P1 |
| UI polish (animations, dark mode) | 2h | P2 |

**Deliverable**: Demo-ready frontend by **Hour 36**

---

### Timeline

```
Hour  0────6────12────18────24────30────36────42
M1:   ████ AUTH ████ SEED+NOTIF ████ AUDIT+DOCS
M2:   ░░░░ VENDOR ███ RFQ ███ QUOTATION+COMPARE
M3:   ░░░░░░░░░░ APPROVAL ███ PO ███ INVOICE ██
M4:   ████ SETUP ████ SCREENS ████████ POLISH ██
```

---

## 7. Git Workflow

### 7.1 Branch Strategy

```
main              ← Production-ready (protected, deploy)
  └── develop     ← Integration branch (all PRs merge here)
       ├── feature/auth              → M1
       ├── feature/vendors           → M2
       ├── feature/rfqs              → M2
       ├── feature/quotation-compare → M2
       ├── feature/approval-engine   → M3
       ├── feature/purchase-orders   → M3
       ├── feature/invoices          → M3
       ├── feature/frontend-setup    → M4
       ├── feature/frontend-screens  → M4
       └── feature/analytics         → M4
```

### 7.2 Commit Convention

```
<type>(<scope>): <description>

Types:  feat | fix | refactor | docs | test | chore | style
Scopes: auth | vendors | rfqs | quotations | approvals | po | invoices | analytics | ui
```

**Examples:**
```
feat(auth): add JWT login and refresh token rotation
feat(quotations): add comparison engine with weighted scoring
fix(approvals): handle concurrent approve race condition
chore(prisma): add seed script with demo data
```

### 7.3 PR Rules

| Rule | Detail |
|---|---|
| **Target** | Always `develop` |
| **Review** | 1 teammate approval minimum |
| **Naming** | `[MODULE] Brief description` |
| **Merge** | Squash merge for clean history |
| **Before PR** | Pull `develop` into your branch first |

### 7.4 Daily Routine

```bash
# Sync: Pull latest develop
git checkout feature/my-module
git pull origin develop

# Work: Commit often
git add .
git commit -m "feat(vendors): add status transition validation"

# Push: Push regularly
git push origin feature/my-module

# PR: When done → create PR → get review → squash merge
```

### 7.5 Conflict Prevention

| Strategy | How |
|---|---|
| Module isolation | Each member owns separate folders |
| Shared files | Only M1 modifies `schema.prisma`, `app.ts` |
| Frequent syncs | Pull `develop` every 2-3 hours |
| Communication | Announce before touching shared files |

---

## 8. Quick Start

```bash
# .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/vendorbridge
JWT_SECRET=your-secret-key
PORT=5000
```

```bash
git clone <repo> && cd vendorbridge-backend
npm install
docker-compose up -d          # Start PostgreSQL
npx prisma migrate dev        # Run migrations
npx prisma db seed            # Seed demo data
npm run dev                   # → http://localhost:5000
```

---

> **Core loop first**: RFQ → Quotation → Compare → Approve → PO. Make it work. Make it beautiful. Then expand.
