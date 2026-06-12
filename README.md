# 🚀 Last Signature — Job Search Aggregator & AI Resume Matcher

Last Signature is a premium, high-end job search aggregator, ATS compatibility matcher, and application tracking pipeline designed to help job seekers discover and track listings from **LinkedIn, Naukri, WeWorkRemotely, Remote.co, and RemoteOK** completely free of charge.

Redesigned with a **Neo-Minimalist Glow (Stripe/Linear style)** visual theme, the interface replaces brutalist layouts with soft glowing outlines, elegant slate backgrounds, rounded components, and precise linear spacing.

---

## 🎨 Design Signatures

1. **Neo-Minimalist Slate Palette**: Background is styled in deep dark slate (`#0B0F19`), cards in darker navy slate (`#151B2C`), and borders in subtle slate-gray (`#1E293B`).
2. **Indigo & Cyan Glow**: Actions, borders, and interactive indicators emit premium neon indigo (`#6366F1`) and cyan (`#06B6D4`) halos on focus and hover.
3. **Plus Jakarta Sans Typography**: Interface headings and body text leverage Google Font **Plus Jakarta Sans**, offering a clean, technical, yet highly legible modern style.
4. **Rounded Geometry**: Cards, select forms, inputs, and buttons feature standard, clean border radii (`6px` to `8px`) replacing harsh sharp edges.
5. **Linear Statistics Marquee**: A continuous, edge-faded scrolling marquee displays live global platform statistics.
6. **Subtle Viewport Texture**: A highly muted 2% opacity noise overlay is applied full-screen to give the interface a premium matte appearance.

---

## ✨ Features Built-In

1. **Unified Job Aggregator**:
   - **Expanded Feeds**: Built-in CLI scraper crawls WeWorkRemotely, Remote.co, and the RemoteOK API to scale listings into hundreds of active jobs.
   - **Direct Apply Links**: Every job card links directly to the specific Greenhouse, Lever, or Remotive job posting page instead of generic corporate landing pages.
2. **Top Toolbar Dropdowns**:
   - Interactive dropdown filters for **Work Mode**, **Location**, **Experience**, and **Minimum Salary** sit right above the feed for seamless, real-time filtering.
3. **Hourly Timestamps**:
   - Job ages are tracked dynamically and displayed strictly in hours ago (e.g., `4h ago`, `38h ago`), giving job seekers real-time freshness context.
4. **ATS Resume Scanner (Keyword Matching)**:
   - Paste resume text to extract compatibility, list matched keywords, detect missing terms, and generate tailored cover letter drafts.
   - **100% Client-Side & Private**: Your resume content remains fully local in the browser.
5. **PPP Salary Converter**:
   - Converts USD salaries to Purchasing Power Parity (PPP) in INR, estimating equivalent local purchasing power.
6. **Kanban Application Board**:
   - A draggable pipeline (*Wishlist, Applied, Interviewing, Offered, Rejected*) to manage active applications, synced to browser storage.
7. **Interactive Ratings Widget**:
   - Compiles company ratings from AmbitionBox and Glassdoor, rendering detailed satisfaction charts.
8. **Simulated Scrapers Console**:
   - Displays real-time crawling logs, proxy status, and database writing processes.

---

## 🛠️ Getting Started & Running

The application runs completely locally with **zero cost** and no database setup required.

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org) installed, then run inside the project directory:
```bash
npm install
```

### 2. Run the Job Web Scraper
Generate the unified database (`jobs.json`) containing fresh opportunities parsed directly from active feeds:
```bash
npm run scan
```

### 3. Open the Dashboard
Simply double-click **`index.html`** or serve the directory using a local HTTP server at `http://localhost:8080`.

---

## 🛡️ Production & Security Blueprint (100% Free Stack)

To deploy this into production securely without exposing keys or paying hosting fees:

1. **Frontend Hosting (Free)**: Deploy the static files to **GitHub Pages**, **Vercel**, or **Netlify** for $0/mo.
2. **Backend API Gateway (Free)**: Move the scraper and AI services to a Node/Express backend hosted on **Render** or **Railway** free plans, keeping credentials hidden from user inspect tools.
3. **Database (Free)**: Connect a PostgreSQL database using the free tier of **Supabase** or **Neon**.
4. **Input Sanitization**: Always validate and clean user inputs to protect against Cross-Site Scripting (XSS).
