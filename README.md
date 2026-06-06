# 🚀 VendorBridge: Intelligent Procurement ERP

VendorBridge is a modern, enterprise-grade, high-performance procurement ERP platform. It connects procurement officers and vendors seamlessly, using AI-assisted matching workflows, automatic 3-way invoice reconciliation, and interactive analytics dashboards.

---

## 🔐 Demo Login Credentials

For testing and demonstration, use the following credentials to access the platform:

> [!IMPORTANT]
> **Email:** `test12345@gmail.com`  
> **Password:** `hetprashant`

---

## ✨ Key Features

### 📊 AI Quotation Comparison Engine
Compare multiple vendor quotes simultaneously in a comprehensive comparison matrix. It highlights the lowest price, fastest delivery time, and best vendor score to guide procurement officers in making rapid, data-informed selection decisions.

### 🏢 Vendor Directory & Scorecard
Monitor and score vendors based on criteria such as delivery timeliness, product quality compliance, and price competitiveness. Drill down into individual vendor histories to see their active contracts and ratings.

### 📦 Purchase Orders (PO) Management
Track purchase orders from initial RFQ matching all the way through delivery. Automatically computes totals, taxes, and maps statuses across Odoo-like workflows.

### 📝 Smart Approval Queues
A dedicated approval dashboard utilizing AI summaries to allow managers to review and sign off on high-value RFQs and Purchase Orders with complete contextual awareness.

### 🧾 Invoice 3-Way Matching Center
Automated validation matching purchase orders, receipt logs, and supplier invoices to highlight discrepancies before payments are approved.

### 📈 Interactive Analytics & Metrics
Modern charts tracking procurement spend, cycle times, approval statistics, and vendor performance breakdowns.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (React 19, Turbopack, Framer Motion, Tailwind CSS, Recharts, Lucide Icons, Zustand)
- **Backend**: Node.js & Express API
- **Database Layer**: Mock Supabase client supporting local file-based database storage (`backend/src/lib/database.json`) for seamless offline operation, with optional configuration for cloud-hosted Supabase services.

---

## 🚀 Quick Start Guide

You can manage both frontend and backend directly from the project root.

### 1. Install Dependencies
Run the install command to install node packages for both directories:
```bash
npm run install-all
```

### 2. Run Locally in Development Mode
Launch both the Express backend and the Next.js frontend concurrently with hot-reloading:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend Service**: `http://localhost:5000`

### 3. Build & Run in Production Mode
For optimal performance and build validation:
```bash
# Build the production bundle
npm run build

# Start the backend and frontend production servers
npm start
```
- **Frontend App**: `http://localhost:3000`
- **Backend Service**: `http://localhost:5000`