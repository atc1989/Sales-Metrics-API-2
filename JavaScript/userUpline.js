// USER UPLINE CONFIG
const USER_UPLINE_API_USER = 'ggitteam';
const USER_UPLINE_ENDPOINT = '/api/userUpline';

// cache of the "root" upline data loaded on first call
let userUplineCache = [];

function getUserUplineApiKey() {
  return generateApiKey(); // same helper as other pages
}

// SUMMARY
function renderUserUplineSummary(rows, summaryEl) {
  if (!summaryEl) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    summaryEl.innerHTML = '';
    return;
  }

  const totalUsers = rows.length;

  summaryEl.innerHTML = `
    <div class="card-grid">
      <div class="card">
        <p class="card-title">Total Nodes</p>
        <p class="card-value">${totalUsers.toLocaleString()}</p>
      </div>
    </div>
  `;
}

// TABLE WRAPPER (uses shared renderTable from common.js)
function renderUserUplineTable(rows) {
  const tableContainer = document.getElementById('user-upline-table-container');
  const columns = [
    { key: 'lvl',       label: 'LEVEL' },
    { key: 'idno',      label: 'ID NO' },
    { key: 'user_name', label: 'USER NAME' },
    { key: 'user',      label: 'USER' },
    { key: 'placement', label: 'PLACEMENT' }
  ];

  renderTable(tableContainer, columns, rows);
}

/**
 * Load data:
 * - If reloadFromServer = true → call API (root hash on backend), cache rows
 * - If reloadFromServer = false & username provided → just filter cached rows
 */
async function loadUserUplineData({ username, reloadFromServer }) {
  const tableContainer = document.getElementById('user-upline-table-container');
  const summaryEl      = document.getElementById('user-upline-summary');

  // 1) Client-side filter mode (no API call)
  if (!reloadFromServer && username && userUplineCache.length) {
    const q = username.toLowerCase();

    const filtered = userUplineCache.filter(row => {
      const uname = (row.user_name || '').toLowerCase();
      const user  = (row.user || '').toLowerCase();
      return uname.includes(q) || user.includes(q);
    });

    renderUserUplineSummary(filtered, summaryEl);
    renderUserUplineTable(filtered);
    return filtered;
  }

  // 2) Server mode: load full tree (root hash handled by backend)
  if (tableContainer) {
    tableContainer.innerHTML =
      '<div class="empty-state">Loading user upline data...</div>';
  }

  try {
    const result = await apiGet(USER_UPLINE_ENDPOINT, {
      user:   USER_UPLINE_API_USER,
      apikey: getUserUplineApiKey()
      // NOTE: no username here → backend uses ROOT_UPLINE_HASH
    });

    const rows = Array.isArray(result?.data) ? result.data : [];

    userUplineCache = rows; // cache the full list

    renderUserUplineSummary(rows, summaryEl);
    renderUserUplineTable(rows);
    return rows;
  } catch (error) {
    console.error('Failed to load user upline data', error);
    if (tableContainer) {
      tableContainer.innerHTML =
        '<div class="empty-state">Sorry, we could not load the user upline data. Please try again.</div>';
    }
    if (summaryEl) summaryEl.innerHTML = '';
    return [];
  }
}

// PAGE INIT
function initUserUplinePage() {
  const usernameInput = document.getElementById('user-upline-username');
  const filterForm    = document.getElementById('user-upline-filter-form');

  if (filterForm) {
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = usernameInput ? usernameInput.value.trim() : '';

      if (!username) {
        // empty → reset to full list from server
        loadUserUplineData({ username: '', reloadFromServer: true });
      } else {
        // filter in cache
        loadUserUplineData({ username, reloadFromServer: false });
      }
    });
  }

  // Initial load: full tree (no username)
  loadUserUplineData({ username: '', reloadFromServer: true });
}

window.loadUserUplineData = loadUserUplineData;
window.initUserUplinePage = initUserUplinePage;
