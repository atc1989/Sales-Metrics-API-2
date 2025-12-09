// SPONSORED DOWNLINE CONFIG
const SPONSORED_DOWNLINE_API_USER = 'ggitteam';
const SPONSORED_DOWNLINE_ENDPOINT = '/api/sponsoredDownline';

function getSponsoredDownlineApiKey() {
  return generateApiKey(); // same helper as everywhere else
}

// SUMMARY
function renderSponsoredDownlineSummary(rows, summaryEl) {
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
function renderSponsoredDownlineTable(rows) {
  const tableContainer = document.getElementById('sponsored-downline-table-container');
  const columns = [
    { key: 'idno',         label: 'ID NO' },
    { key: 'registered',   label: 'REGISTERED' },
    { key: 'user_name',    label: 'USER NAME' },
    { key: 'user',         label: 'USER' },
    { key: 'account_type', label: 'ACCOUNT TYPE' },
    { key: 'payment',      label: 'PAYMENT' }
  ];

  renderTable(tableContainer, columns, rows);
}

/**
 * Load data:
 * - Always calls the API (like userUpline)
 * - If username is empty → backend uses its ROOT_DOWNLINE_HASH or default
 */
async function loadSponsoredDownlineData({ username }) {
  const tableContainer = document.getElementById('sponsored-downline-table-container');
  const summaryEl      = document.getElementById('sponsored-downline-summary');

  if (tableContainer) {
    tableContainer.innerHTML =
      '<div class="empty-state">Loading sponsored downline data...</div>';
  }

  try {
    const params = {
      user:   SPONSORED_DOWNLINE_API_USER,
      apikey: getSponsoredDownlineApiKey()
    };

    // Only send username if there is one; otherwise backend uses its root hash
    if (username) {
      params.username = username;
    }

    const result = await apiGet(SPONSORED_DOWNLINE_ENDPOINT, params);

    const rows = Array.isArray(result?.data) ? result.data : [];

    if (!rows.length) {
      console.warn('No sponsored downline data found for username:', username || '(root)');
    }

    renderSponsoredDownlineSummary(rows, summaryEl);
    renderSponsoredDownlineTable(rows);
    return rows;
  } catch (error) {
    console.error('Failed to load sponsored downline data', error);
    if (tableContainer) {
      tableContainer.innerHTML =
        '<div class="empty-state">Sorry, we could not load the sponsored downline data. Please try again.</div>';
    }
    if (summaryEl) summaryEl.innerHTML = '';
    return [];
  }
}

// PAGE INIT
function initSponsoredDownlinePage() {
  const usernameInput = document.getElementById('sponsored-downline-username');
  const filterForm    = document.getElementById('sponsored-downline-filter-form');

  if (filterForm) {
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = usernameInput ? usernameInput.value.trim() : '';
      loadSponsoredDownlineData({ username });
    });
  }

  // Initial load with NO username → backend uses its default/root
  loadSponsoredDownlineData({ username: '' });
}

window.loadSponsoredDownlineData = loadSponsoredDownlineData;
window.initSponsoredDownlinePage = initSponsoredDownlinePage;
