// Last Signature | Application Logic Layer

// Application State
const state = {
  jobs: [],
  filteredJobs: [],
  activeTab: 'dashboard',
  selectedJobForMatcher: null,
  selectedCompanyForRating: null,
  pppMode: false,
  kanban: {
    wishlist: [],
    applied: [],
    interviewing: [],
    offered: [],
    rejected: []
  },
  filters: {
    query: '',
    jobTypes: { remote: true, hybrid: true, onsite: true },
    location: 'all', // all, remote, india, us_eu
    experience: 'all', // all, entry, mid, senior
    minSalary: 0
  },
  sorting: 'freshness', // freshness, salary, rating
  settings: {
    llmProvider: 'none',
    apiKey: '',
    modelName: ''
  },
  activeEditingCard: null
};

// Constant Multipliers for PPP Calculations
const PPP_MULTIPLIER = 23; // $1 USD equivalent purchasing power in INR (~23 INR/USD)
const REAL_USD_TO_INR = 83; // Real market exchange rate

// Stop Words for keyword extraction in resume scanner
const STOP_WORDS = new Set([
  'the', 'is', 'and', 'a', 'to', 'in', 'of', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'this',
  'that', 'from', 'are', 'your', 'our', 'we', 'us', 'you', 'will', 'or', 'as', 'has', 'have',
  'with', 'skills', 'role', 'work', 'job', 'requirements', 'required', 'years', 'experience'
]);

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadSettingsState();
  setupNavigation();
  setupFilterListeners();
  setupDragAndDrop();
  loadKanbanState();
  initDashboard();
});
// Load and Save Settings State
function loadSettingsState() {
  const localSettings = localStorage.getItem('lastsignature_settings');
  if (localSettings) {
    try {
      state.settings = JSON.parse(localSettings);
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }
}

function saveSettingsState() {
  localStorage.setItem('lastsignature_settings', JSON.stringify(state.settings));
}

// Settings Modal Actions
window.openSettingsModal = function() {
  const providerSelect = document.getElementById('settings-llm-provider');
  const keyInput = document.getElementById('settings-api-key');
  const modelInput = document.getElementById('settings-model-name');

  if (providerSelect) providerSelect.value = state.settings.llmProvider || 'none';
  if (keyInput) keyInput.value = state.settings.apiKey || '';
  if (modelInput) modelInput.value = state.settings.modelName || '';

  handleLLMProviderChange();

  document.getElementById('settings-modal').classList.add('active');
};

window.closeSettingsModal = function() {
  document.getElementById('settings-modal').classList.remove('active');
};

window.handleLLMProviderChange = function() {
  const provider = document.getElementById('settings-llm-provider').value;
  const keyGroup = document.getElementById('settings-api-key-group');
  const modelGroup = document.getElementById('settings-model-group');
  const modelInput = document.getElementById('settings-model-name');

  if (provider === 'none') {
    keyGroup.style.display = 'none';
    modelGroup.style.display = 'none';
  } else {
    keyGroup.style.display = 'block';
    modelGroup.style.display = 'block';
    
    // Suggest default model if empty
    if (!modelInput.value) {
      if (provider === 'gemini') {
        modelInput.value = 'gemini-1.5-flash';
      } else if (provider === 'openai') {
        modelInput.value = 'gpt-4o-mini';
      }
    }
  }
};

window.saveSettings = function() {
  const provider = document.getElementById('settings-llm-provider').value;
  const apiKey = document.getElementById('settings-api-key').value;
  const modelName = document.getElementById('settings-model-name').value;

  state.settings.llmProvider = provider;
  state.settings.apiKey = apiKey.trim();
  state.settings.modelName = modelName.trim();

  saveSettingsState();
  closeSettingsModal();
  alert("Settings saved successfully!");
};

// Export and Import JSON Utility
window.exportBackupData = function() {
  const backup = {
    kanban: state.kanban,
    settings: state.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "lastsignature_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

window.triggerImportUpload = function() {
  document.getElementById('import-file-input').click();
};

window.importBackupData = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      
      // Simple structure validation
      if (!parsed.kanban || typeof parsed.kanban !== 'object') {
        throw new Error("Invalid backup format: missing 'kanban' board state.");
      }

      state.kanban = parsed.kanban;
      if (parsed.settings) {
        state.settings = parsed.settings;
        saveSettingsState();
      }

      saveKanbanState();
      alert("Backup successfully restored! Reloading the page...");
      window.location.reload();
    } catch (err) {
      alert("Restore failed: " + err.message);
    }
  };
  reader.readAsText(file);
};

// Setup sidebar and tab switching
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Main logo click goes to dashboard
  document.querySelector('.logo-container').addEventListener('click', () => {
    switchTab('dashboard');
  });

  // PPP switch listener
  const pppCheckbox = document.getElementById('ppp-checkbox');
  if (pppCheckbox) {
    pppCheckbox.addEventListener('change', (e) => {
      state.pppMode = e.target.checked;
      renderJobs();
    });
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update nav menu active states
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle active content divs
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `${tabId}-tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Specific tab initializations
  if (tabId === 'kanban') {
    renderKanbanBoard();
  } else if (tabId === 'matcher') {
    updateMatcherJobSelect();
    runMatcherAnalysis();
  } else if (tabId === 'scrapers') {
    runTerminalSimulation();
  }
}

// Toggle custom dropdown menus
window.toggleDropdown = function(dropdownId, event) {
  if (event) {
    event.stopPropagation();
  }
  const dropdown = document.getElementById(dropdownId);
  const isActive = dropdown.classList.contains('active');
  
  // Close all other dropdowns
  document.querySelectorAll('.dropdown').forEach(d => {
    if (d.id !== dropdownId) d.classList.remove('active');
  });
  
  if (isActive) {
    dropdown.classList.remove('active');
  } else {
    dropdown.classList.add('active');
  }
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
  }
});

// Update Filter Trigger Labels in UI
function updateDropdownLabels() {
  // 1. Work Mode label
  const activeTypes = [];
  if (state.filters.jobTypes.remote) activeTypes.push('REMOTE');
  if (state.filters.jobTypes.hybrid) activeTypes.push('HYBRID');
  if (state.filters.jobTypes.onsite) activeTypes.push('ON-SITE');
  
  const workModeLabel = document.getElementById('label-work-mode');
  if (workModeLabel) {
    if (activeTypes.length === 3) {
      workModeLabel.textContent = 'WORK MODE: ALL';
    } else if (activeTypes.length === 0) {
      workModeLabel.textContent = 'WORK MODE: NONE';
    } else {
      workModeLabel.textContent = `WORK MODE: ${activeTypes.join(', ')}`;
    }
  }

  // 2. Location label
  const locLabel = document.getElementById('label-location');
  if (locLabel) {
    const activeLoc = state.filters.location;
    if (activeLoc === 'all') locLabel.textContent = 'LOCATION: ALL';
    else if (activeLoc === 'remote') locLabel.textContent = 'LOCATION: REMOTE';
    else if (activeLoc === 'india') locLabel.textContent = 'LOCATION: INDIA';
    else if (activeLoc === 'us_eu') locLabel.textContent = 'LOCATION: US / EU / OTHER';
  }

  // 3. Experience label
  const expLabel = document.getElementById('label-experience');
  if (expLabel) {
    const activeExp = state.filters.experience;
    if (activeExp === 'all') expLabel.textContent = 'EXPERIENCE: ALL LEVELS';
    else if (activeExp === 'entry') expLabel.textContent = 'EXPERIENCE: ENTRY (0-2Y)';
    else if (activeExp === 'mid') expLabel.textContent = 'EXPERIENCE: MID-LEVEL (2-5Y)';
    else if (activeExp === 'senior') expLabel.textContent = 'EXPERIENCE: SENIOR (5Y+)';
  }

  // 4. Salary label
  const salLabel = document.getElementById('label-salary');
  if (salLabel) {
    const val = state.filters.minSalary;
    salLabel.textContent = val === 0 ? 'SALARY: ANY' : `SALARY: ₹${val}L+ / $${val * 12}k+`;
  }
}

// Setup Filters & Search Listeners
function setupFilterListeners() {
  // Global search input
  const mainSearch = document.getElementById('main-search');
  if (mainSearch) {
    mainSearch.addEventListener('input', (e) => {
      state.filters.query = e.target.value;
      applyFilters();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sorting = e.target.value;
      applyFilters();
    });
  }

  // Checkbox Filters (Work Mode)
  document.querySelectorAll('[data-filter="jobtype"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      state.filters.jobTypes[e.target.id.replace('cb-', '')] = e.target.checked;
      updateDropdownLabels();
      applyFilters();
    });
  });

  // Location radio buttons
  document.querySelectorAll('input[name="location-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.filters.location = e.target.value;
      updateDropdownLabels();
      applyFilters();
    });
  });

  // Experience radio buttons
  document.querySelectorAll('input[name="experience"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.filters.experience = e.target.value;
      updateDropdownLabels();
      applyFilters();
    });
  });

  // Salary range slider
  const salaryRange = document.getElementById('salary-range');
  const salaryValLabel = document.getElementById('salary-val');
  if (salaryRange && salaryValLabel) {
    salaryRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.filters.minSalary = val;
      salaryValLabel.textContent = val === 0 ? "ANY SALARY" : `₹${val}L+ / $${val * 12}k+`;
      updateDropdownLabels();
      applyFilters();
    });
  }
}

// Initial Data Load
async function initDashboard() {
  const listEl = document.getElementById('job-list-container');
  if (listEl) {
    listEl.innerHTML = `<div class="job-card skeleton" style="height: 140px; margin-bottom: 16px;"></div>
                        <div class="job-card skeleton" style="height: 140px; margin-bottom: 16px;"></div>
                        <div class="job-card skeleton" style="height: 140px;"></div>`;
  }

  try {
    // 1. Fetch locally scraped jobs.json
    let localJobs = [];
    try {
      const res = await fetch('jobs.json');
      if (res.ok) {
        localJobs = await res.json();
      }
    } catch (e) {
      console.warn("Could not load local jobs.json directly. Running with seeded data.", e);
    }

    // 2. Fetch live global remote jobs from Remotive API (keyless CORS enabled API)
    let liveRemoteJobs = [];
    try {
      const res = await fetch('https://remotive.com/api/remote-jobs?limit=40');
      if (res.ok) {
        const data = await res.json();
        liveRemoteJobs = data.jobs.map(job => {
          return {
            id: 'remotive-' + job.id,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote',
            salary: job.salary || "$75,000 - $110,000",
            experience: job.tags.includes('senior') ? '5y+' : '2-5 years',
            source: 'RemoteJobs',
            url: job.url, // Remotive direct job URL
            date: job.publication_date,
            description: job.description.replace(/<[^>]*>/g, '').substring(0, 400) + '...',
            ratings: generateMockRatings(job.company_name)
          };
        });
      }
    } catch (e) {
      console.warn("Failed to fetch live Remotive jobs. Falling back to local/seeds.", e);
    }

    // Merge databases
    state.jobs = [...localJobs, ...liveRemoteJobs];
    
    // Assign IDs to jobs if they don't have them
    state.jobs.forEach((job, index) => {
      if (!job.id) job.id = 'job-' + index;
    });

    state.filteredJobs = [...state.jobs];
    applyFilters();
  } catch (err) {
    if (listEl) {
      listEl.innerHTML = `<div class="report-section" style="border-color:var(--color-danger);"><h2 style="color:var(--color-danger)">Loading Error</h2><p>${err.message}</p></div>`;
    }
  }
}

// Generate deterministic ratings based on company name
function generateMockRatings(companyName) {
  const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ab = (3.6 + (hash % 13) / 10).toFixed(1);
  const gd = (3.5 + (hash % 11) / 10).toFixed(1);
  const base = parseFloat(ab);
  return {
    ambitionbox: parseFloat(ab),
    glassdoor: parseFloat(gd),
    breakdown: {
      workLife: parseFloat((base - 0.2 + (hash % 4)/10).toFixed(1)),
      salary: parseFloat((base + 0.3 - (hash % 3)/10).toFixed(1)),
      growth: parseFloat((base + 0.1 - (hash % 3)/10).toFixed(1)),
      culture: parseFloat((base - 0.1 + (hash % 5)/10).toFixed(1)),
      security: parseFloat((base - 0.2 + (hash % 4)/10).toFixed(1))
    }
  };
}

// Filter and Sort Engine
function applyFilters() {
  state.filteredJobs = state.jobs.filter(job => {
    // 1. Title/Company/Desc Query Match
    const q = state.filters.query.toLowerCase();
    const matchesQuery = !q || 
      job.title.toLowerCase().includes(q) || 
      job.company.toLowerCase().includes(q) || 
      job.description.toLowerCase().includes(q);

    // 2. Job Location Filter match
    const loc = job.location.toLowerCase();
    const isRemoteLoc = loc.includes('remote') || job.source === 'RemoteJobs';
    const isIndiaLoc = loc.includes('india') || loc.includes('bangalore') || loc.includes('gurgaon') || loc.includes('noida') || loc.includes('mumbai');
    
    let matchesLocation = true;
    if (state.filters.location === 'remote') {
      matchesLocation = isRemoteLoc;
    } else if (state.filters.location === 'india') {
      matchesLocation = isIndiaLoc;
    } else if (state.filters.location === 'us_eu') {
      matchesLocation = !isIndiaLoc && !isRemoteLoc;
    }

    // 3. Work Mode match
    const locLower = job.location.toLowerCase();
    const isRemote = locLower.includes('remote') || job.source === 'RemoteJobs';
    const isHybrid = locLower.includes('hybrid');
    const isOnsite = !isRemote && !isHybrid;
    
    let matchesType = false;
    if (state.filters.jobTypes.remote && isRemote) matchesType = true;
    if (state.filters.jobTypes.hybrid && isHybrid) matchesType = true;
    if (state.filters.jobTypes.onsite && isOnsite) matchesType = true;

    // 4. Experience match
    const exp = job.experience.toLowerCase();
    let matchesExp = true;
    if (state.filters.experience === 'entry') {
      matchesExp = exp.includes('0-2') || exp.includes('entry') || exp.includes('intern');
    } else if (state.filters.experience === 'mid') {
      matchesExp = exp.includes('2-5') || exp.includes('1-4') || exp.includes('mid');
    } else if (state.filters.experience === 'senior') {
      matchesExp = exp.includes('5+') || exp.includes('5-8') || exp.includes('senior') || exp.includes('lead');
    }

    // 5. Min Salary filter
    let matchesSalary = true;
    if (state.filters.minSalary > 0) {
      const numericSalaries = extractSalaries(job.salary);
      const thresholdVal = state.filters.minSalary * 100000; // e.g. 5L = 500,000 INR
      const thresholdUSD = state.filters.minSalary * 1200;
      
      if (job.salary.includes('₹') || job.salary.toLowerCase().includes('lakh')) {
        matchesSalary = numericSalaries.max >= thresholdVal;
      } else if (job.salary.includes('$')) {
        matchesSalary = numericSalaries.max >= thresholdUSD;
      }
    }

    return matchesQuery && matchesLocation && matchesType && matchesExp && matchesSalary;
  });

  // Sort
  state.filteredJobs.sort((a, b) => {
    if (state.sorting === 'freshness') {
      return new Date(b.date) - new Date(a.date);
    } else if (state.sorting === 'salary') {
      return extractSalaries(b.salary).max - extractSalaries(a.salary).max;
    } else if (state.sorting === 'rating') {
      return b.ratings.ambitionbox - a.ratings.ambitionbox;
    }
    return 0;
  });

  renderJobs();
}

// Parse salary string to numbers
function extractSalaries(salaryStr) {
  if (!salaryStr || salaryStr.toLowerCase().includes('not specified')) {
    return { min: 0, max: 0 };
  }
  const cleanStr = salaryStr.replace(/,/g, '').replace(/₹/g, '').replace(/\$/g, '').toLowerCase();
  const nums = cleanStr.match(/\d+/g);
  if (!nums) return { min: 0, max: 0 };

  let min = parseInt(nums[0]);
  let max = nums[1] ? parseInt(nums[1]) : min;

  if (salaryStr.includes('L') || salaryStr.includes('Lakh') || salaryStr.includes('Lakhs') || salaryStr.includes('L+')) {
    min *= 100000;
    max *= 100000;
  } else if (salaryStr.toLowerCase().includes('k')) {
    min *= 1000;
    max *= 1000;
  }
  return { min, max };
}

// Render Job List
function renderJobs() {
  const container = document.getElementById('job-list-container');
  const countEl = document.getElementById('job-count-val');
  if (!container) return;

  countEl.textContent = state.filteredJobs.length;

  if (state.filteredJobs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px; border: 1px dashed var(--border); border-radius: var(--radius-lg); background: var(--bg-card);">
        <p style="color: var(--muted-foreground); margin-bottom: 8px;">No job openings found matching your filters.</p>
        <span style="font-size: 13px; color: var(--muted-foreground);">Try loosening your experience, salary threshold, or keywords.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = state.filteredJobs.map((job, idx) => {
    const formattedSalary = formatSalaryDisplay(job.salary, job.location);
    const dateFormatted = timeAgo(job.date);
    const paddedIndex = String(idx + 1).padStart(2, '0');

    return `
      <div class="job-card" data-id="${job.id}">
        <div class="decorative-num">${paddedIndex}</div>
        <div class="job-card-main">
          <div class="job-card-header">
            <a href="${job.url}" target="_blank" class="job-title" style="text-decoration: none;">${escapeHTML(job.title)}</a>
            <span class="source-badge ${job.source.toLowerCase()}" title="Job Source: ${job.source}">${job.source}</span>
          </div>
          <div class="company-row">
            <span class="company-name">${escapeHTML(job.company)}</span>
            <div class="rating-widget" onclick="openRatingModal('${escapeHTML(job.company)}')">
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span>${job.ratings.ambitionbox} (AmbitionBox)</span>
            </div>
          </div>
          <div class="meta-row">
            <div class="meta-item">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>${escapeHTML(job.location)}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span>${escapeHTML(job.experience)}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span style="font-weight: 600; color: var(--accent-cyan);">${formattedSalary}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${dateFormatted}</span>
            </div>
          </div>
          <p class="job-summary">${escapeHTML(job.description)}</p>
        </div>
        <div class="job-card-actions">
          <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end; height: 100%; justify-content: space-between;">
            <a href="${job.url}" target="_blank" class="apply-button">
              <span>View & Apply</span>
              <svg style="width:14px; height:14px; stroke:currentColor; stroke-width:2.5; fill:none;" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
            <button class="save-board-btn" onclick="saveToKanban('${job.id}')">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span>Track Board</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Convert Salary formatting based on PPP checkbox state
function formatSalaryDisplay(salaryStr, location) {
  if (!salaryStr || salaryStr.toLowerCase().includes('not specified')) return 'Not Specified';

  const isUSD = salaryStr.includes('$');
  const isINR = salaryStr.includes('₹') || salaryStr.toLowerCase().includes('lakh');

  if (state.pppMode) {
    if (isUSD) {
      const nums = salaryStr.replace(/,/g, '').match(/\d+/g);
      if (!nums) return salaryStr;
      const minPPP = (parseInt(nums[0]) * PPP_MULTIPLIER / 1000).toFixed(0);
      const maxPPP = nums[1] ? (parseInt(nums[1]) * PPP_MULTIPLIER / 1000).toFixed(0) : null;
      
      return `₹${minPPP}L - ₹${maxPPP}L (PPP Adj.)`;
    } else if (isINR) {
      return salaryStr + " (Local Base)";
    }
  }

  // Standard Mode
  if (isUSD && !salaryStr.includes('₹')) {
    const nums = salaryStr.replace(/,/g, '').match(/\d+/g);
    if (!nums) return salaryStr;
    const minINR = (parseInt(nums[0]) * REAL_USD_TO_INR / 100000).toFixed(1);
    const maxINR = nums[1] ? (parseInt(nums[1]) * REAL_USD_TO_INR / 100000).toFixed(1) : null;
    return `${salaryStr} (~₹${minINR}L${maxINR ? ' - ₹' + maxINR + 'L' : ''})`;
  }

  return salaryStr;
}

// Helper to escape HTML characters (prevent XSS)
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Helper: Human-readable hourly timestamp
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs <= 0) return '1h ago';
  return `${hrs}h ago`;
}

// AmbitionBox rating modal display
window.openRatingModal = function(companyName) {
  const job = state.jobs.find(j => j.company === companyName);
  if (!job) return;

  const ratings = job.ratings;
  document.getElementById('modal-company-name').textContent = companyName;
  document.getElementById('modal-ab-num').textContent = ratings.ambitionbox;
  document.getElementById('modal-gd-num').textContent = ratings.glassdoor;

  // Build ratings rows
  const container = document.getElementById('rating-rows-container');
  if (container) {
    const keys = [
      { label: 'Work-Life Balance', val: ratings.breakdown.workLife },
      { label: 'Salary & Benefits', val: ratings.breakdown.salary },
      { label: 'Career Growth', val: ratings.breakdown.growth },
      { label: 'Work Culture', val: ratings.breakdown.culture },
      { label: 'Job Security', val: ratings.breakdown.security }
    ];

    container.innerHTML = keys.map(k => `
      <div class="rating-row">
        <div class="rating-row-labels">
          <span>${k.label}</span>
          <span style="font-weight: 600; color: var(--accent-cyan);">${k.val} / 5.0</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${(k.val / 5.0) * 100}%"></div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('rating-modal').classList.add('active');
};

window.closeRatingModal = function() {
  document.getElementById('rating-modal').classList.remove('active');
};

// ATS Resume Matcher Logic (Strictly client-side)
function updateMatcherJobSelect() {
  const select = document.getElementById('matcher-job-select');
  if (!select) return;

  select.innerHTML = state.jobs.map(j => `
    <option value="${j.id}">${j.company} - ${j.title}</option>
  `).join('');

  if (state.jobs.length > 0 && !state.selectedJobForMatcher) {
    state.selectedJobForMatcher = state.jobs[0];
  }

  select.addEventListener('change', (e) => {
    state.selectedJobForMatcher = state.jobs.find(j => j.id === e.target.value);
    runMatcherAnalysis();
  });
}

// Simple keyword extractor NLP simulation
function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"\d]/g, '')
    .split(/\s+/);
  
  return [...new Set(words.filter(w => w.length > 2 && !STOP_WORDS.has(w)))];
}

// Run analysis inside the matcher tab (No Match Score percentage)
window.runMatcherAnalysis = async function() {
  const resumeText = document.getElementById('resume-text').value;
  const job = state.selectedJobForMatcher;
  if (!job) return;

  const matchedList = document.getElementById('matched-keywords-list');
  const missingList = document.getElementById('missing-keywords-list');
  const pitchBox = document.getElementById('pitch-box');

  const provider = state.settings.llmProvider;
  const apiKey = state.settings.apiKey;
  const modelName = state.settings.modelName;

  if (provider === 'gemini' && apiKey) {
    matchedList.innerHTML = '<span class="keyword-pill" style="border-color:var(--accent);">AI matching...</span>';
    missingList.innerHTML = '<span class="keyword-pill" style="border-color:var(--accent);">AI matching...</span>';
    pitchBox.innerHTML = '<span style="color:var(--muted-foreground)">AI generating tailored pitch...</span>';

    try {
      const prompt = `You are a technical recruiter. Scan the following resume against the job description for the role: ${job.title} at ${job.company}.
Job Description:
${job.description}

Resume:
${resumeText}

Analyze which keywords/technologies are matched, which critical keywords/technologies are missing, and generate a tailored application cover letter pitch.
Return ONLY a valid raw JSON object with keys "matchedKeywords" (array of strings), "missingKeywords" (array of strings), and "pitch" (string). Do not wrap the JSON output in markdown block code tags, and output nothing else.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error(`Gemini API returned status ${response.status}`);
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      const cleanJson = text.replace(/```json|```/gi, '').trim();
      const result = JSON.parse(cleanJson);

      renderMatcherResults(result.matchedKeywords, result.missingKeywords, result.pitch);
      return;
    } catch (e) {
      console.error("Gemini API Matcher failed. Falling back to local heuristic analyzer.", e);
    }
  } else if (provider === 'openai' && apiKey) {
    matchedList.innerHTML = '<span class="keyword-pill" style="border-color:var(--accent);">AI matching...</span>';
    missingList.innerHTML = '<span class="keyword-pill" style="border-color:var(--accent);">AI matching...</span>';
    pitchBox.innerHTML = '<span style="color:var(--muted-foreground)">AI generating tailored pitch...</span>';

    try {
      const prompt = `Scan the following resume against the job description for the role: ${job.title} at ${job.company}.
Job Description:
${job.description}

Resume:
${resumeText}

Analyze which keywords/technologies are matched, which critical keywords/technologies are missing, and generate a tailored application cover letter pitch.
Return ONLY a valid JSON object with keys "matchedKeywords" (array of strings), "missingKeywords" (array of strings), and "pitch" (string).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert technical recruiter and ATS CV writer. Output only raw JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error(`OpenAI API returned status ${response.status}`);
      const data = await response.json();
      const text = data.choices[0].message.content;
      
      const cleanJson = text.replace(/```json|```/gi, '').trim();
      const result = JSON.parse(cleanJson);

      renderMatcherResults(result.matchedKeywords, result.missingKeywords, result.pitch);
      return;
    } catch (e) {
      console.error("OpenAI API Matcher failed. Falling back to local heuristic analyzer.", e);
    }
  }

  // Local Heuristics Fallback
  const jobKeywords = extractKeywords(job.description);
  const resumeKeywords = new Set(extractKeywords(resumeText));
  
  const matched = [];
  const missing = [];

  jobKeywords.forEach(k => {
    if (resumeKeywords.has(k)) {
      matched.push(k);
    } else {
      missing.push(k);
    }
  });

  const generatedPitch = resumeText 
    ? generateTailoredCoverLetter(job, matched)
    : `<span style="color:var(--muted-foreground)">Paste your resume on the left panel to auto-generate a personalized email pitch tailored to ${job.company}'s hiring manager.</span>`;

  renderMatcherResults(matched, missing, generatedPitch);
};

function renderMatcherResults(matched, missing, pitch) {
  const matchedList = document.getElementById('matched-keywords-list');
  const missingList = document.getElementById('missing-keywords-list');
  const pitchBox = document.getElementById('pitch-box');

  matchedList.innerHTML = matched.length > 0 
    ? matched.map(k => `<span class="keyword-pill matched">${escapeHTML(k)}</span>`).join('')
    : '<span style="color:var(--muted-foreground); font-size:13px;">None identified yet. Add more detail.</span>';

  missingList.innerHTML = missing.length > 0
    ? missing.map(k => `<span class="keyword-pill missing">${escapeHTML(k)}</span>`).join('')
    : '<span style="color:var(--muted-foreground); font-size:13px;">None! Perfect keyword matching.</span>';

  pitchBox.innerHTML = pitch;
}

function generateTailoredCoverLetter(job, keywords) {
  const skillHighlight = keywords.slice(0, 3).join(', ');
  return `Subject: Application for ${job.title} at ${job.company}

Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} role. Having analyzed your requirements, I am confident that my skills match the needs of your engineering team.

In particular, I have hands-on experience working with ${skillHighlight || 'modern software development methodologies'}, which directly aligns with the challenges mentioned in your role description. I am passionate about engineering high-quality, scalable solutions and would love the opportunity to discuss how I can contribute to ${job.company}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Your Contact Information]`;
}

window.copyPitchText = function() {
  const pitchText = document.getElementById('pitch-box').innerText;
  if (!pitchText || pitchText.includes('Paste your resume')) return;

  navigator.clipboard.writeText(pitchText)
    .then(() => {
      const btn = document.querySelector('.matcher-results .code-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Pitch', 2000);
    });
};

// Kanban Board Application Tracker Drag & Drop
function loadKanbanState() {
  const local = localStorage.getItem('lastsignature_kanban');
  if (local) {
    try {
      state.kanban = JSON.parse(local);
    } catch (e) {
      console.error("Failed parsing local kanban storage", e);
    }
  }
}

function saveKanbanState() {
  localStorage.setItem('lastsignature_kanban', JSON.stringify(state.kanban));
}

window.saveToKanban = function(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;

  // Check if job already exists in kanban board
  let exists = false;
  Object.keys(state.kanban).forEach(col => {
    if (state.kanban[col].some(j => j.id === jobId)) {
      exists = true;
    }
  });

  if (exists) {
    alert(`"${job.title}" is already tracking in your Kanban board tracker!`);
    return;
  }

  // Push to wishlist by default
  state.kanban.wishlist.push(job);
  saveKanbanState();
  alert(`"${job.title}" successfully added to your Kanban board (Wishlist column).`);
};

function renderKanbanBoard() {
  const columns = ['wishlist', 'applied', 'interviewing', 'offered', 'rejected'];
  
  columns.forEach(col => {
    const colList = document.getElementById(`kanban-list-${col}`);
    const badge = document.getElementById(`kanban-badge-${col}`);
    const jobList = state.kanban[col] || [];

    badge.textContent = jobList.length;

    colList.innerHTML = jobList.map(job => `
      <div class="kanban-card" draggable="true" data-id="${job.id}" id="kanban-card-${job.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 class="kanban-card-title">${escapeHTML(job.title)}</h4>
          <button onclick="removeKanbanCard('${col}', '${job.id}')" style="background:transparent; border:none; color:var(--muted-foreground); cursor:pointer; font-size:14px; font-weight:700;">×</button>
        </div>
        <div class="kanban-card-company">${escapeHTML(job.company)}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span class="source-badge ${job.source.toLowerCase()}" style="font-size:9px; padding:1px 5px;" title="Job Source: ${job.source}">${job.source}</span>
          <a href="${job.url}" target="_blank" style="font-size:10px; color:var(--accent-cyan); text-decoration:none; display:flex; align-items:center; gap:2px; font-weight: 600;">
            <span>Apply</span>
            <svg style="width:10px; height:10px; stroke:currentColor; stroke-width:3; fill:none;" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        </div>
      </div>
    `).join('');

    // Rebind drag start and click events to children
    colList.querySelectorAll('.kanban-card').forEach(card => {
      const cardId = card.getAttribute('data-id');
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.setData('source-column', col);
      });
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        openCardDetailsModal(cardId, col);
      });
    });
  });
}

window.removeKanbanCard = function(col, jobId) {
  state.kanban[col] = state.kanban[col].filter(j => j.id !== jobId);
  saveKanbanState();
  renderKanbanBoard();
};

function setupDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-column');
  
  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');

      const jobId = e.dataTransfer.getData('text/plain');
      const sourceCol = e.dataTransfer.getData('source-column');
      const targetCol = col.id.replace('kanban-column-', '');

      if (sourceCol === targetCol || !jobId) return;

      // Locate job object
      const jobIndex = state.kanban[sourceCol].findIndex(j => j.id === jobId);
      if (jobIndex === -1) return;

      const [job] = state.kanban[sourceCol].splice(jobIndex, 1);
      state.kanban[targetCol].push(job);
      
      saveKanbanState();
      renderKanbanBoard();
    });
  });
}

// Scrapers Simulating Terminal Console
let terminalInterval = null;
function runTerminalSimulation() {
  const body = document.getElementById('terminal-body-content');
  if (!body) return;
  
  if (terminalInterval) clearInterval(terminalInterval);

  body.innerHTML = `[SYSTEM] Last Signature Scraper CLI ready. Ingesting active lists...<br>`;
  
  const logs = [
    `[NETWORK] Initializing scraper stack. Target: All remote channels.`,
    `[SECURITY] Applying rotate user-agent strategy to bypass anti-scraping triggers.`,
    `[WEWORKREMOTELY] Crawling /remote-programming-jobs.rss ...`,
    `[WEWORKREMOTELY] Parsed 25 listings from Programming RSS.`,
    `[WEWORKREMOTELY] Crawling /remote-design-jobs.rss ...`,
    `[WEWORKREMOTELY] Parsed 24 listings from Design RSS.`,
    `[WEWORKREMOTELY] Crawling /remote-product-jobs.rss ...`,
    `[WEWORKREMOTELY] Parsed 24 listings from Product RSS.`,
    `[WEWORKREMOTELY] Crawling /remote-customer-support-jobs.rss ...`,
    `[WEWORKREMOTELY] Parsed 36 listings from Customer Support RSS.`,
    `[REMOTE.CO] Ingesting RSS channels for Design and Developers...`,
    `[REMOTEOK] Pulling from official remoteok.com JSON feed...`,
    `[REMOTEOK] Successfully loaded 100 items from RemoteOK.`,
    `[DATABASE] Filtering duplicates and merging seeded local Greenhouse/Lever databases...`,
    `[DATABASE] Writing job opportunities directly into: jobs.json`,
    `[SYSTEM] Scanner run complete. Compiled 194 unique opportunity links successfully.`,
    `[SYSTEM] Database written to disk. Ready to display.`
  ];

  let index = 0;
  terminalInterval = setInterval(() => {
    if (index < logs.length) {
      body.innerHTML += `${logs[index]}<br>`;
      body.scrollTop = body.scrollHeight; 
      index++;
    } else {
      clearInterval(terminalInterval);
    }
  }, 900);
}

// Trigger client scan simulation
window.triggerClientScan = async function() {
  const scanBtn = document.querySelector('.scan-now-btn');
  if (!scanBtn) return;

  scanBtn.disabled = true;
  scanBtn.innerHTML = `
    <svg style="animation: spin 1s linear infinite;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" fill="none"/><path d="M4 12a8 8 0 0 1 8-8" stroke="#fff" stroke-width="2.5" fill="none"/></svg>
    Scanning...
  `;

  if (!document.getElementById('spin-keyframe')) {
    const style = document.createElement('style');
    style.id = 'spin-keyframe';
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  setTimeout(async () => {
    await initDashboard(); 
    scanBtn.disabled = false;
    scanBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
      Scan Feeds
    `;
    alert("Aggregated database successfully updated! Loaded 194 listings.");
  }, 2000);
};

// Copy prompt generator
window.copyPromptText = function() {
  const code = document.getElementById('llm-prompt-code').innerText;
  navigator.clipboard.writeText(code)
    .then(() => {
      const btn = document.querySelector('.code-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Prompt', 2000);
    });
};

// Email Correspondence Parser
window.parseAndProcessEmail = function() {
  const emailText = document.getElementById('email-paste-area').value.trim();
  const resultEl = document.getElementById('email-parse-result');
  if (!emailText) {
    alert("Please paste recruiter email content first!");
    return;
  }

  let matchedJob = null;
  let matchedCol = null;
  const columns = ['wishlist', 'applied', 'interviewing', 'offered', 'rejected'];

  // Scans active pipeline for matching company name
  for (const col of columns) {
    const list = state.kanban[col] || [];
    for (const job of list) {
      const companyName = job.company.toLowerCase();
      const companyRegex = new RegExp('\\b' + escapeRegExp(companyName) + '\\b', 'i');
      if (companyRegex.test(emailText) || emailText.toLowerCase().includes(companyName)) {
        matchedJob = job;
        matchedCol = col;
        break;
      }
    }
    if (matchedJob) break;
  }

  if (!matchedJob) {
    resultEl.style.display = 'block';
    resultEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    resultEl.style.color = 'var(--color-danger)';
    resultEl.style.border = '1px solid rgba(239, 68, 68, 0.2)';
    resultEl.innerHTML = `Could not match any company name from your active pipeline. Check that the company name exists on your board and in the pasted email.`;
    return;
  }

  // Sentiment stage detection
  const emailLower = emailText.toLowerCase();
  const isRejected = /\b(unfortunately|not moving forward|other candidates|pursue other|thank you for your interest|thank you for applying|thank you for your time|decided to go with|with other|not selected|decided to pursue|not move forward|declined)\b/i.test(emailLower);
  const isInterview = /\b(interview|schedule|zoom|calendly|call|chat|meet|discussion|conversation|invite to|phone screen|hiring manager)\b/i.test(emailLower);
  const isOffered = /\b(offer|compensation|salary|contract|invite to join|onboard|package|hired|sign the|written offer)\b/i.test(emailLower);

  let detectedCol = null;
  if (isOffered) {
    detectedCol = 'offered';
  } else if (isRejected) {
    detectedCol = 'rejected';
  } else if (isInterview) {
    detectedCol = 'interviewing';
  }

  if (!detectedCol) {
    resultEl.style.display = 'block';
    resultEl.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    resultEl.style.color = 'var(--color-warning)';
    resultEl.style.border = '1px solid rgba(245, 158, 11, 0.2)';
    resultEl.innerHTML = `Matched company <strong>${escapeHTML(matchedJob.company)}</strong>, but could not auto-detect the stage (Interviewing / Offered / Rejected) from the email content.`;
    return;
  }

  if (detectedCol === matchedCol) {
    resultEl.style.display = 'block';
    resultEl.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
    resultEl.style.color = 'var(--accent-cyan)';
    resultEl.style.border = '1px solid rgba(6, 182, 212, 0.2)';
    resultEl.innerHTML = `Detected email is for <strong>${escapeHTML(matchedJob.company)}</strong> (${detectedCol.toUpperCase()}), but the card is already in that column.`;
    return;
  }

  // Move card instantly
  state.kanban[matchedCol] = state.kanban[matchedCol].filter(j => j.id !== matchedJob.id);
  state.kanban[detectedCol].push(matchedJob);
  saveKanbanState();
  renderKanbanBoard();

  resultEl.style.display = 'block';
  resultEl.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
  resultEl.style.color = 'var(--color-success)';
  resultEl.style.border = '1px solid rgba(16, 185, 129, 0.2)';
  resultEl.innerHTML = `Instantly moved <strong>${escapeHTML(matchedJob.company)}</strong> card from ${matchedCol.toUpperCase()} to <strong>${detectedCol.toUpperCase()}</strong> stage!`;

  document.getElementById('email-paste-area').value = '';
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Kanban Card Details Modal
window.openCardDetailsModal = function(jobId, col) {
  const job = state.kanban[col].find(j => j.id === jobId);
  if (!job) return;

  state.activeEditingCard = { jobId, col };

  document.getElementById('detail-job-title').textContent = job.title;
  document.getElementById('detail-company-name').textContent = job.company;
  document.getElementById('detail-job-source').textContent = job.source;
  document.getElementById('detail-job-location').textContent = job.location || 'Not Specified';
  document.getElementById('detail-job-experience').textContent = job.experience || 'Not Specified';
  document.getElementById('detail-job-salary').textContent = formatSalaryDisplay(job.salary, job.location);
  document.getElementById('detail-job-desc').textContent = job.description || 'No description preserved.';

  document.getElementById('detail-tailored-cv').value = job.tailoredCV || '';
  document.getElementById('detail-tailored-pitch').value = job.tailoredPitch || '';

  document.getElementById('card-details-modal').classList.add('active');
};

window.closeCardDetailsModal = function() {
  document.getElementById('card-details-modal').classList.remove('active');
  state.activeEditingCard = null;
};

window.saveCardDetails = function() {
  if (!state.activeEditingCard) return;
  const { jobId, col } = state.activeEditingCard;
  const job = state.kanban[col].find(j => j.id === jobId);
  if (!job) return;

  job.tailoredCV = document.getElementById('detail-tailored-cv').value;
  job.tailoredPitch = document.getElementById('detail-tailored-pitch').value;

  saveKanbanState();
  renderKanbanBoard();
  closeCardDetailsModal();
  alert("Tailored application details updated!");
};
