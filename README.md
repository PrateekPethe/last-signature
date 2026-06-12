# 🚀 Last Signature — Job Search Aggregator & AI Resume Matcher

Last Signature is a premium, high-energy brutalist job search aggregator, ATS compatibility matcher, and application tracking pipeline designed to help job seekers discover, score, and track listings from **LinkedIn, Naukri, and RemoteJobs** completely free of charge.

Stylized with a **Kinetic Typography** visual layout, the dashboard rejects typical static shapes. Giant viewport headlines, endless moving marquees, flat 2px borders, and solid color inversions turn this job aggregator into a high-impact, interactive poster.

---

## 🎨 Design Signatures

1. **Brutalist Geometry**: All border-radii are set strictly to `0px` (completely sharp corners). Structural outlines use flat 2px solid lines (`border-2 border-[#3F3F46]`).
2. **Space Grotesk Typography**: Headings and display text use Google Font **Space Grotesk**, rendered in bold uppercase with tight letter spacing (`tracking-tighter`).
3. **Infinite Marquees**: Continuous, GPU-accelerated horizontal marquees display live platform statistics across the screen.
4. **Hard Color Inversions**: Cards and buttons completely flood with vibrant Acid Yellow (`#DFE104`) and invert text color to black instantaneously on hover.
5. **Massive Graphic Numbers**: Oversized background numbers (`8rem` to `12rem`) in muted tones are layered behind content blocks to create graphical depth.
6. **SVG Noise Texture**: A 3% opacity noise overlay (`mix-blend-mode: overlay`) filter is layered full-screen across the viewport.

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
Simply double-click **`index.html`** or load the hosted local dev server at `http://localhost:8080`.

---

## 🛡️ Production & Security Blueprint (100% Free Stack)

To deploy this into production securely without exposing keys or paying hosting fees:

1. **Frontend Hosting (Free)**: Deploy the static files to **GitHub Pages**, **Vercel**, or **Netlify** for $0/mo.
2. **Backend API Gateway (Free)**: Move the scraper and AI services to a Node/Express backend hosted on **Render** or **Railway** free plans, keeping your credentials hidden from user inspect tools.
3. **Database (Free)**: Connect a PostgreSQL database using the free tier of **Supabase** or **Neon**.
4. **Input Sanitization**: Always validate and clean user inputs to protect against Cross-Site Scripting (XSS).
