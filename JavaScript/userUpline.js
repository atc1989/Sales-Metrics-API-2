const { load } = require("mime");

// USER UPLINE CONFIG
const USER_UPLINE_API_USER = 'ggitteam';
const USER_UPLINE_ENDPOINT = '/api/userupline';

function getUserUplineApiKey() {
  return generateApiKey();
}

// SUMMARY
function renderUserUplineSummary(rows, summaryEl) {
  if (!summaryEl) return;

    if (!Array.isArray(rows) || rows.length === 0) {
    summaryEl.innerHTML = 'No user upline data available.';
    return;
  }

    const totalUsers = rows.length;

    summaryEl.innerHTML = `
    <div class="card-grid">
      <div class="card">
        <p class="card-title">Total Users</p>
        <p class="card-value">${totalUsers.toLocaleString()}</p>
      </div>
    </div>
  `;
}

// TABLE WRAPPER
function renderUserUplineTable(rows) {
    const tableContainer = document.getElementById('user-upline-table-container');
    const columns = [
        { key: 'lvl', label: 'Level'},
        { key: 'idno', label: 'ID No'},
        { key: 'user_name', label: 'User Name'},
        { key: 'user', label: 'User'},
        { key: 'placement', label: 'Placement'},
    ];

    renderTable(tableContainer, columns, rows);
}

// DATA LOADING
async function loadUserUplineData({ search }) {
    const tableContainer = document.getElementById('user-upline-table-container');
    const summaryEl      = document.getElementById('user-upline-summary');

    if (tableContainer) {
        tableContainer.innerHTML = '<p class="empty-state">Loading user upline data...</p>';
    }

    try {
        const result = await apiGet(USER_UPLINE_ENDPOINT, {
            user:   USER_UPLINE_API_USER,
            apikey: getUserUplineApiKey(),
            search
        });

        const rows = Array.isArray(result?.data) ? result.data : [];

        if (!rows.length) {
            console.warn('No user upline data found for the given search criteria.');
        }

        renderUserUplineSummary(rows, summaryEl);
        renderUserUplineTable(rows);
        return rows;
    } catch (error) {
        console.error('Failed to load user upline data', error);
        if (tableContainer) {
            tableContainer.innerHTML = '<div class="empty-state">Sorry, we could not load the user upline data. Please try again.</div>';
        }
        if (summaryEl) {
            summaryEl.innerHTML = '';
        }
        return [];
    }
}

// PAGE INIT
function initUserUplinePage() {
    const searchInput = document.getElementById('search-input');
    const filterForm  = document.getElementById('user-upline-filter-form');

    if (filterForm) {
        filterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const search = searchInput ? searchInput.value.trim() : '';
            loadUserUplineData({ search });
        });
    }

    if (searchInput) {
        console.error('Search input found, initializing with empty search.');
    }

    const defaultSearch = '';
    if (searchInput) {
        searchInput.value = defaultSearch;
    }

    loadUserUplineData({ search: defaultSearch });
}

window.loadUserUplineData = loadUserUplineData;
window.initUserUplinePage = initUserUplinePage;