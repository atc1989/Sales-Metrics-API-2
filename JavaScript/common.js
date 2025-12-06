// ---- DATE HELPERS (shared by all pages) ----
function getDefaultDateRange(daysBack = 7) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - daysBack);

  return {
    from: formatDateForInput(from),
    to: formatDateForInput(today)
  };
}

function formatDateForInput(date) {
  return date.toISOString().slice(0, 10); // yyyy-mm-dd
}

function formatDateForApi(inputValue) {
  return inputValue ? inputValue.replace(/-/g, '') : '';
}

// ---- GENERIC TABLE RENDERER (shared) ----
/**
 * @param {HTMLElement} container
 * @param {Array<{key:string,label:string}>} columns
 * @param {Array<Object>} rows
 * @param {string} emptyMessage
 */
function renderTable(container, columns, rows, emptyMessage = 'No data found for this filter.') {
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(rows) || rows.length === 0) {
    container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    columns.forEach((col) => {
      const td = document.createElement('td');
      td.textContent = row[col.key] ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}

// Generate API key in the format: hhyyyymmdd
// Example: 11:00 on 2025-12-06 => "1120251206"
function generateApiKey(date = new Date()) {
  const pad2 = (n) => n.toString().padStart(2, '0');

  const hh   = pad2(date.getHours());       // 00–23
  const yyyy = date.getFullYear();          // 2025
  const mm   = pad2(date.getMonth() + 1);   // 01–12
  const dd   = pad2(date.getDate());        // 01–31

  return `${hh}${yyyy}${mm}${dd}`;
}
