# 🚀 Last Signature — Job Search Aggregator & AI Resume Matcher

Last Signature is a premium, high-fidelity job search aggregator, ATS compatibility matcher, and application tracking pipeline designed to help job seekers discover, score, and track listings from **LinkedIn, Naukri, and RemoteJobs** completely free of charge.

Stylized like an **authentic wobbly paper sketchbook/notebook**, Last Signature rejects geometric precision in favor of hand-drawn elements, handwriting typography, and tactile interactions, while remaining a robust, fully-featured utility for your job hunt.

---

## 🎨 Design Signatures

1. **No Straight Lines**: Every button, input box, filter card, and container uses irregular wobbly borders (using custom border-radius properties).
2. **Notebook Canvas**: The page is styled in a warm paper color (`#fdfbf7`) overlayed with a repeating dot-grid structure.
3. **Hard Offset Shadows**: Blurred shadows are avoided; instead, flat offsets (`4px 4px 0px 0px #2d2d2d`) give elements a cut-paper collage look.
4. **Interactive Personality**: Buttons "press flat" by shifting their margins on click, and cards jiggle playfully when you hover over them.
5. **Authentic Notebook Accents**: Visual details like thumbtacks and masking tape anchor cards and sections.
6. **Handwritten Typography**: Set in Google Fonts **Kalam** (felt-tip marker style for headings) and **Patrick Hand** (clean handwriting for body text).

---

## ✨ Features Built-In

1. **Unified Job Aggregator (LinkedIn + Naukri + RemoteJobs)**:
   - **Live API Ingestion**: Pulls real-time global remote listings dynamically from public feeds (**Remotive API**).
   - **Local RSS Scraper CLI**: Built-in script (`scanner.js`) crawls public RSS feeds for LinkedIn and Remote.co, merging them with seed databases.
2. **ATS Resume Scanner (Smart Match)**:
   - Paste resume text to compute match percentage against any listing.
   - **100% Client-Side & Private**: Your resume never leaves your computer.
   - Highlights matched and missing keywords and drafts tailored email pitches.
3. **PPP Salary Converter**:
   - Recalculates USD salaries into local Indian Rupees (INR) based on actual purchasing power differences.
4. **Kanban Application Board**:
   - A draggable status board (*Wishlist, Applied, Interviewing, Offered, Rejected*) to manage your pipeline, saved directly to browser local storage.
5. **Interactive Ratings Widget**:
   - Compiles company ratings from AmbitionBox and Glassdoor, rendering detailed satisfaction charts.
6. **Simulated Scrapers Console**:
   - Interactive log console detailing crawler network calls, user-agent rotations, and database compiles.

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
Simply double-click **`index.html`** to load the dashboard in your browser!
- On Windows (PowerShell):
  ```powershell
  Start-Process index.html
  ```

---

## 🛡️ Production & Security Blueprint (100% Free Stack)

To deploy this into production securely without exposing keys or paying hosting fees:

1. **Frontend Hosting (Free)**: Deploy the static files to **GitHub Pages**, **Vercel**, or **Netlify** for $0/mo.
2. **Backend API Gateway (Free)**: Move the scraper and AI services to a Node/Express backend hosted on **Render** or **Railway** free plans, keeping your credentials hidden from user inspect tools.
3. **Database (Free)**: Connect a PostgreSQL database using the free tier of **Supabase** or **Neon**.
4. **Input Sanitization**: Always validate and clean user inputs to protect against Cross-Site Scripting (XSS).
