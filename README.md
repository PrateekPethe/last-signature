# 🚀 JobRadar — Premium Job Aggregator & AI Matcher

JobRadar is a premium, high-fidelity job search aggregator, ATS compliance matcher, and application tracking pipeline designed to help job seekers discover, score, and track listings from **LinkedIn, Naukri, and RemoteJobs** completely free of charge.

This project delivers **10/10 UI/UX** utilizing glassmorphism, fluid animations, dynamic data updates, and a zero-cost local scraping framework to bypass paid API blocks.

---

## ✨ Features Built-In

1. **Integrated Real-Job Engine**:
   - **Live Ingestion**: Dynamic, real-time fetching of remote tech jobs from public keyless API feeds (**Remotive API**).
   - **Local RSS Scraper**: A built-in CLI script (`scanner.js`) that crawls public RSS feeds for LinkedIn (India & Worldwide) and Remote.co, merging them with seed local databases.
2. **ATS Resume Matcher (Smart Match)**:
   - Paste resume text to automatically compute compatibility percentage against any listing's description.
   - Highlights matching keywords, identifies missing topics, and generates a personalized application pitch email.
3. **Purchasing Power Parity (PPP) Converter**:
   - Toggle PPP mode to instantly recalculate USD salaries into local Indian purchasing power equivalents (INR), adjusting for relative cost of living differences.
4. **Kanban Application Pipeline**:
   - Fully interactive, client-side drag-and-drop tracker board (*Wishlist, Applied, Interviewing, Offered, Rejected*) synced with `localStorage`.
5. **Interactive Ratings Widget**:
   - Compiles company ratings from AmbitionBox and Glassdoor, rendering detailed satisfaction charts for Work-Life Balance, Compensation, Growth, Culture, and Security.
6. **Simulated Scrapers Console**:
   - Interactive log console detailing crawler network calls, user-agent rotations, Cloudflare bypass events, and data writes.

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
*(This triggers `node scanner.js` which scrapes the live feeds and outputs a clean `jobs.json` file).*

### 3. Open the Dashboard
Simply open **`index.html`** in your browser!
- On Windows (PowerShell):
  ```powershell
  Start-Process index.html
  ```
- Or just double-click the `index.html` file in your explorer window.

---

## 🛡️ Production & Security Blueprint (100% Free Stack)

To deploy this into production securely without exposing keys or paying hosting fees:

1. **Frontend Hosting (Free)**: Deploy the static `index.html`, `styles.css`, and `app.js` to **GitHub Pages**, **Vercel**, or **Netlify** for $0/mo.
2. **Backend API Gateway (Free)**: Move the scraper and AI services to a Node/Express backend hosted on **Render** (Free Tier) or **Railway** (Developer Tier). Store secret credentials (like Gemini API keys for resume analysis) in environment variables (`.env`). The frontend calls this gateway, meaning your keys are never exposed in user browsers.
3. **Database (Free)**: Connect a PostgreSQL database using the free tier of **Supabase** or **Neon**. 
4. **Input Sanitization**: Always run input sanitization (like we do in `app.js`) to protect against Cross-Site Scripting (XSS) when displaying raw text scraped from the web.

---

## 📋 Technology Stack
- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS (CSS Grid, Variables, Glassmorphism, CSS Transitions)
- **Logic**: ES6 JavaScript (LocalStorage API, Drag & Drop API, Fetch API)
- **Scraper Stack**: Node.js, `axios` (HTTP requester), `rss-parser` (XML feed parser)
