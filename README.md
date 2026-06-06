# VendorBridge Procurement ERP

A modern, high-performance procurement ERP platform featuring an AI Quotation Comparison Engine, Vendor Directory & Scorecard, smart approval workflows, and interactive analytics.

## Getting Started

You can install all dependencies and run both the frontend and backend servers concurrently using the root commands.

### 1. Install All Dependencies

From the root directory, run:
```bash
npm run install-all
```

### 2. Run Both Servers Locally

From the root directory, run:
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: Local JSON mock database (`backend/src/lib/database.json`)

### Seed Credentials

Use these pre-seeded accounts to log in on the frontend:
- **Procurement Officer**: `priya@vendorbridge.com` / `Password@123`
- **Manager**: `anand@vendorbridge.com` / `Password@123`
- **Admin**: `admin@vendorbridge.com` / `Password@123`