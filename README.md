# FinTrack Pro - Personal & Shared Finance Management System

<p align="center">
  <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80" alt="FinTrack Pro Banner" width="100%" style="border-radius: 12px; max-height: 320px; object-fit: cover;" />
</p>

<p align="center">
  <strong>A full-stack, offline-first multi-user personal finance, daily expense, SIP investment, and debt tracking web and mobile application with complete support for 24 Indian languages.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Languages-24%20Indian%20Languages-FF9933" alt="24 Indian Languages" />
  <img src="https://img.shields.io/badge/Storage-Offline%20First%20%2B%20Cloud-success" alt="Storage" />
</p>

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Supported Categories & Workspaces](#-supported-categories--workspaces)
3. [Supported Indian Languages](#-supported-indian-languages-24)
4. [Tech Stack & Architecture](#-tech-stack--architecture)
5. [Quick Start & Local Development](#-quick-start--local-development)
6. [One-Click Windows & Desktop Setup](#-one-click-windows--desktop-setup)
7. [Android APK & Mobile PWA Setup](#-android-apk--mobile-pwa-setup)
8. [Publishing to GitHub & GitHub Pages](#-publishing-to-github--github-pages)
9. [Backend Server API Reference](#-backend-server-api-reference)
10. [Folder Structure](#-folder-structure)
11. [Data Storage & Security](#-data-storage--security)
12. [License](#-license)

---

## ✨ Key Features

### 💰 Comprehensive Transaction Management
- **Three Core Streams**: Track **Income**, **Expenses**, and **Investments** with granular categorization.
- **Dedicated Categories**: Built-in support for **Dharma**, **Rental**, **Groceries**, **Travel**, **Education**, **Health**, **SIP**, **Mutual Funds**, **Stocks**, **Gold / Sovereign Gold Bonds**, and **Real Estate**.
- **Payment Method Logging**: Categorize transactions by UPI (Google Pay, PhonePe, Paytm), Net Banking/NEFT/RTGS, Debit/Credit Card, or Cash.
- **Search, Filters & Date Ranges**: Filter by category, payment mode, user, custom date intervals, or tags.

### 📈 SIP & Investment Portfolio Analytics
- **Systematic Investment Plans (SIP)**: Real-time calculation of invested capital, expected CAGR returns, asset distribution pie charts, and monthly SIP outflow tracking.
- **Net Worth Calculation**: Automatic consolidation of total savings, active investments, liquid funds, and outstanding debts.

### 🤝 Lending & Borrowing Ledger (Udhar / Khata)
- **Debt Tracking**: Record money lent to friends/family/colleagues or borrowed funds.
- **Partial & Full Repayments**: Record progressive repayments with automated ledger balance recalculation and status badges (*Pending*, *Partially Settled*, *Settled*).
- **Due Date Reminders**: Visual indicators for overdue or impending settlement dates.

### 🎯 Monthly Budgeting & Overspend Alerts
- **Category Budgets**: Set dedicated spending limits for Groceries, Rental, Dharma, Utilities, Health, etc.
- **Visual Progress Bars**: Color-coded threshold alerts (80% warning, 100% exceeded) to prevent overspending.

### ⏰ Recurring Automated Transactions
- **Interval Scheduler**: Schedule daily, weekly, monthly, quarterly, or yearly recurring salary credits, SIP deductions, rent, or donations.
- **Auto-Process Engine**: Automatically generates transaction entries on scheduled due dates upon application launch.

### 👥 Multi-User Workspaces & Collaboration
- **Workspaces**: Switch seamlessly between **Personal**, **Family**, **Business**, or custom shared spaces.
- **Role-Based Permissions**: Granular roles (*Owner*, *Admin*, *Editor*, *Viewer*) with secure invitation links.
- **Creator Metadata**: Every record tracks creator name, timestamp, and audit history.

### 🖨️ PDF Statements & Financial Reports
- **Statement Generator**: Generate clean, printable A4 financial statements and export reports to CSV or printable format.
- **Interactive Visualizations**: Powered by Recharts for monthly cash flow comparisons, expense distributions, and income vs. expense curves.

---

## 🏷️ Supported Categories & Workspaces

| Category Group | Categories Included |
| :--- | :--- |
| **Expenses** | **Dharma**, **Rental**, Groceries, Travel, Education, Health, Dining, Shopping, Utilities, Entertainment, Miscellaneous |
| **Investments** | SIP (Systematic Investment Plans), Mutual Funds, Stocks / Equity, Fixed Deposits (FD), Recurring Deposits (RD), Gold / SGB, Real Estate, Crypto |
| **Income** | Salary, Freelance / Business, Rental Income, Dividend & Interest, Capital Gains, Gift / Allowance |

---

## 🇮🇳 Supported Indian Languages (24)

FinTrack Pro offers **100% offline native translation** across 24 Indian languages and dialects:

1. **English** (Default)
2. **Hindi** (हिन्दी)
3. **Bengali** (বাংলা)
4. **Marathi** (मराठी)
5. **Telugu** (తెలుగు)
6. **Tamil** (தமிழ்)
7. **Gujarati** (ગુજરાતી)
8. **Urdu** (اردو)
9. **Kannada** (ಕನ್ನಡ)
10. **Odia** (ଓଡ଼ିଆ)
11. **Malayalam** (മലയാളം)
12. **Punjabi** (ਪੰਜਾਬੀ)
13. **Assamese** (অসমীয়া)
14. **Maithili** (मैथिली)
15. **Sanskrit** (संस्कृतम्)
16. **Santali** (ᱥᱟᱱᱛᱟᱲᱤ)
17. **Kashmiri** (کٲشُر)
18. **Nepali** (नेपाली)
19. **Konkani** (कोंकणी)
20. **Sindhi** (سنڌي)
21. **Dogri** (डोगरी)
22. **Manipuri / Meitei** (মৈতৈলোন্)
23. **Bodo** (बड़ो)
24. **Marwari** (मारवाड़ी)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Recharts (Data Visualizations), Canvas Confetti.
- **Build System**: Vite 5 with relative routing optimization (`base: './'`).
- **Backend / API**: Express 4, Node.js, RESTful JSON storage and WebSocket/Polling synchronization.
- **Storage Tier**: Dual-layer architecture:
  - *Browser Mode*: High-performance local persistence with `localStorage` and `IndexedDB`.
  - *Full-Stack Mode*: Express `/api` persistence engine with file-based JSON/SQLite databases in `/data`.
- **Mobile & Desktop**: Capacitor 5 (Android native runtime), PWA Web Manifest, Windows VBScript desktop batch runners.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or 20.x recommended)
- `npm` (bundled with Node.js) or `yarn` / `pnpm` / `bun`

### Installation & Run

```bash
# 1. Clone your repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Start development server (Frontend + Backend API)
npm run dev
```

Open your browser at: **`http://localhost:3000`**

### Production Build & Standalone Node Server

```bash
# Build the production bundle
npm run build

# Start the compiled Node.js backend server
npm start
```

---

## 💻 1-Click Windows PC Installation & Desktop App

For zero-configuration offline desktop usage on Windows:

1. Open the **`Single_Click_Install_PC`** folder.
2. Double-click **`1-Click_Install_and_Launch_PC.bat`**:
   - Automatically installs required dependencies.
   - Creates a **"FinTrack Pro (Offline)"** shortcut directly on your Windows Desktop.
   - Launches the local application in your default browser at `http://localhost:3000`.
3. For subsequent launches, simply double-click the **"FinTrack Pro (Offline)"** Desktop icon or **`Start_FinTrack_Pro.bat`**.

---

## 📱 1-Click Android APK & Mobile Installation

### Option 1: 1-Click APK Builder (Windows)
1. Open the **`Single_Click_Install_Android`** folder.
2. Double-click **`1-Click_Build_Android_APK.bat`**.
3. It will automatically build the production assets, sync the Capacitor project, and compile **`FinTrack_Pro.apk`**.
4. Transfer `FinTrack_Pro.apk` to your phone and install!

### Option 2: Direct Install to Connected Phone (USB Debugging)
1. Connect your Android phone with USB Debugging enabled.
2. Double-click **`1-Click_Install_To_Connected_Phone.bat`** in `Single_Click_Install_Android`.

### Option 3: Direct Progressive Web App (PWA) Install
1. Open the application URL in Google Chrome on your Android or iOS device.
2. Tap the browser menu (**⋮** or Share button) ➜ Tap **"Install app"** or **"Add to Home Screen"**.
3. Launch the app like a native mobile app with full-screen view and offline functionality.

---

## 🌐 Publishing to GitHub & GitHub Pages

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit of FinTrack Pro"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Enable Automated GitHub Pages Deployment
This repository comes with an automated GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. In your GitHub repository, navigate to **Settings** ➜ **Pages**.
2. Under **Build and deployment** ➜ **Source**, select **GitHub Actions**.
3. Any push to `main` will automatically build the app and deploy it to:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 📡 Backend Server API Reference

The built-in Express server provides RESTful endpoints for multi-device sync:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and server status |
| `GET` | `/api/transactions` | Fetch all transactions for the active workspace |
| `POST` | `/api/transactions` | Create a new income, expense, or investment record |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/lend-borrow` | Retrieve debt and loan records |
| `POST` | `/api/lend-borrow` | Create or update a lending/borrowing record |
| `POST` | `/api/lend-borrow/:id/repay` | Record a partial or full debt repayment |
| `GET` | `/api/budgets` | Fetch monthly category limits and alerts |
| `POST` | `/api/budgets` | Save or update monthly budget targets |
| `GET` | `/api/recurring` | Fetch recurring scheduled transactions |
| `POST` | `/api/recurring` | Create a new recurring rule |
| `GET` | `/api/workspaces` | Fetch available workspaces and member lists |

---

## 📂 Folder Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD automated workflow
├── public/                     # Static assets, icons, manifest
├── src/
│   ├── components/             # Reusable UI views & modals
│   │   ├── DashboardView.tsx   # Core summary, metrics, and charts
│   │   ├── TransactionsView.tsx# Transaction ledger, filters & search
│   │   ├── TransactionModal.tsx# Form for creating/editing transactions
│   │   ├── BudgetsView.tsx     # Budgeting targets and alerts
│   │   ├── RecurringTransactionsView.tsx # Recurring schedule engine
│   │   ├── LendingBorrowingView.tsx # Udhar & debt management
│   │   ├── InvestmentsView.tsx # SIP and asset portfolio analytics
│   │   ├── ReportsView.tsx     # Financial statements & exports
│   │   ├── Navbar.tsx          # Responsive navigation & language picker
│   │   └── CategoryIcon.tsx    # Category icon renderer (Flame, Building, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx     # User profiles and authentication
│   │   ├── FinanceContext.tsx  # Global state manager for finance records
│   │   └── LanguageContext.tsx # 24 Indian languages i18n manager
│   ├── i18n/
│   │   ├── languages.ts        # Language codes and metadata
│   │   └── translations.ts     # Multilingual translation dictionaries
│   ├── utils/
│   │   ├── formatters.ts       # Currency (₹ INR), date, and category configs
│   │   ├── offlineStorage.ts   # LocalStorage & IndexedDB offline cache
│   │   └── printStatement.ts   # A4 printable statement generator
│   ├── types.ts                # TypeScript types & interfaces
│   ├── App.tsx                 # Main application controller
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles & Tailwind CSS
├── server.ts                   # Express.js backend server
├── capacitor.config.json       # Android Capacitor configuration
├── Single_Click_Install_PC/    # 💻 1-Click Windows PC Installation & Launchers
│   ├── 1-Click_Install_and_Launch_PC.bat # Auto-installer & desktop shortcut creator
│   ├── Start_FinTrack_Pro.bat  # Fast launcher for daily use
│   └── README_PC_INSTALL.md    # Step-by-step PC instructions
├── Single_Click_Install_Android/ # 📱 1-Click Android APK & USB Installer
│   ├── 1-Click_Build_Android_APK.bat # Automatic APK builder & Studio launcher
│   ├── 1-Click_Install_To_Connected_Phone.bat # Direct ADB USB installation
│   └── README_ANDROID_INSTALL.md # Android & mobile deployment guide
├── package.json                # Dependencies and build scripts
└── vite.config.ts              # Vite bundler configuration
```

---

## 🔒 Data Storage & Security

- **Offline-First Resilience**: All financial logs, categories, and settings are cached locally. You can record transactions without an internet connection, and they will sync once the server or network is available.
- **Privacy Guaranteed**: In client-only and local mode, your sensitive financial records stay on your personal device and are never transmitted to third-party ad trackers.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and deploy for personal and commercial projects.
