# ReviewLens — Enterprise AI Customer Feedback Analytics Dashboard

ReviewLens is a production-quality, responsive customer review analytics platform built using Next.js, Tailwind CSS, Prisma, Framer Motion, and Recharts. It integrates custom Google Gemini API processing alongside rule-based heuristic database fallbacks.

## 🚀 Key Features

- **Enterprise Dashboard View**: 4 KPI counters (NPS score, NLP classification confidence, review counts, average stars) alongside Recharts pie, horizontal bar, radar, and area charts.
- **Reviews Data Explorer**: An interactive data grid featuring text search, drop-down filters for sentiment/product, column sorting, pagination, and slide-open row expansion displaying extracted topic/keyword tags.
- **Data Import Center**: Drag-and-drop CSV parser with upload progress bar simulation, row count verification, and preview table grids, in addition to manual rating submission forms.
- **AI Strategic Insights**: Automated GET routes querying Gemini models using JSON schema specifications to compile executive briefings, complaints matrixes, loved features lists, and operational business plans.
- **AI Chat Assistant**: Chat assistant capable of scanning customer reviews from the SQLite database to answer analytical queries. Includes automatic heuristic fallbacks if offline.
- **System Settings**: Theme switcher, developers secret API copy/generation managers, and email alert threshold configuration.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS, Class Variance Authority
- **Animations**: Framer Motion
- **Database**: SQLite (via Prisma Client)
- **State Management**: Zustand, React Hooks
- **AI Integrations**: Native Google Gemini API Connectivity (via fetch)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root of the project. Specify the variables below (refer to [\.env.example](file:///c:/Users/kisho/OneDrive/Documents/iq%20AI/.env.example)):

```ini
# Database connection string (SQLite file path relative to prisma folder)
DATABASE_URL="file:../db/custom.db"

# Google AI Studio API Key (Generate at: https://aistudio.google.com/)
GEMINI_API_KEY="your-google-gemini-api-key"

# Optional: Override default Gemini model (defaults to gemini-2.5-flash)
# GEMINI_MODEL="gemini-2.5-flash"
```

*Note: The AI Chat Assistant and Insights sections will automatically activate local heuristic fallbacks if `GEMINI_API_KEY` is not configured, allowing you to test full functionalities immediately without keys!*

---

## 💻 Local Setup & Installation

### 1. Install Dependencies
Ensure you have Node.js 18+ installed on your computer.
```bash
npm install
```

### 2. Generate Prisma Client
Build the query engine binaries optimized for your local operating system:
```bash
npx prisma generate
```

### 3. Initialize & Sync Database
Ensure the seeded sqlite file under `db/custom.db` is linked:
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view the application.

---

## 🏗️ Production Build & Verification

### Build Application
Compile all page routes and generate serverless static bundles:
```bash
npm run build
```

### Run Production Server
```bash
npm run start
```

---

## ☁️ Vercel Deployment Instructions

Follow these steps to deploy the application on **Vercel**:

### 1. Set Up Database Provider for Serverless
Since SQLite uses a local file system (`custom.db`) which is read-only and ephemeral in serverless environments like Vercel, it is recommended to transition to an external database for production (e.g., PostgreSQL, MySQL, Supabase, or Neon).
- Update the `provider` and `url` parameters in `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- Run migrations: `npx prisma migrate deploy`

### 2. Import Git Repository
1. Push the codebase to your GitHub account.
2. Sign in to Vercel and click **Add New Project**.
3. Select your repository to import it.

### 3. Configure Build Settings
Under the project configuration panel:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `prisma generate && next build`

### 4. Add Environment Variables
Add the following key-value pairs in the project settings:
- `DATABASE_URL` (your production PostgreSQL/Supabase URL)
- `GEMINI_API_KEY` (your Google Gemini API Key)
- `GEMINI_MODEL` (optional: `gemini-2.5-flash`)

Click **Deploy**! Vercel will build the application, compile TypeScript pages, and serve it on a global Edge CDN.
