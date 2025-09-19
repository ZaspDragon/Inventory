const STORAGE_KEY = 'inventoryLog.v3';
let logEntries = [];

// DOM refs
const form = document.getElementById('logForm');
const nameEl = document.getElementById('name');
const dateEl = document.getElementById('date');
const problemSelect = document.getElementById('problemSelect');
const problemOther = document.getElementById('problemOther');
const locationEl = document.getElementById('location');
const actionSelect = document.getElementById('actionSelect');
const actionOther = document.getElementById('actionOther');
const notesEl = document.getElementById('notes');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const reportBtn = document.getElementById('reportBtn');
const tableBody = document.querySelector('#logTable tbody');
const emptyState = document.getElementById('emptyState');
const searchEl = document.getElementById('search');
const reportPreview = document.getElementById('reportPreview');

// Init
setToday();
loadEntries();
render();
updateReportPreview();

// Toggle "Other" inputs
problemSelect.addEventListener('change', () => {
  const isOther = problemSelect.value === 'Other';
  problemOther.style.display = isOther ? 'block' : 'none';
  if (!isOther) problemOther.value = '';
});

actionSelect.addEventListener('change', () => {
  const isOther = actionSelect.value === 'Other';
  actionOther.style.display = isOther ? 'block' : 'none';
  if (!isOther) actionOther.value = '';
});

function setToday() {
  const today = new Date();
  dateEl.value = today.toISOString().slice(0,10);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logEntries));
}

function loadEntries() {
  try {
    logEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(logEntries)) logEntries = [];
  } catch {
    logEntries = [];
  }
}

function addEntry(entry) {
  logEntries.unshift({ id: crypto.randomUUID(), ...entry, createdAt: Date.now() });
  save();
  render();
  updateReportPreview();

  // Auto-generate a report every 12 entries
  if (logEntries.length % 12 === 0) {
    const latest12 = logEntries.slice(0, 12).reverse(); // oldest to newest for the report
    const html = buildReportHTML(latest12);
    downloadReport(html);
  }
}

function deleteEntry(id) {
  logEntries = logEntries.filter(e => e.id !== id);
  save();
  render();
  updateReportPreview();
}

function clearAll() {
  if (confirm('Clear ALL saved entries? This cannot be undone.')) {
    logEntries = [];
    save();
    render();
    updateReportPreview();
  }
}

function render() {
  const q = (searchEl.value || '').toLowerCase().trim();
  const rows = logEntries.filter(e =>
    [e.date, e.name, e.problem, e.location, e.action, e.notes].join(' ').toLowerCase().includes(q)
  );

  tableBody.innerHTML = '';
  rows.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.name || ''}</td>
      <td>${e.problem}</td>
      <td>${e.location}</td>
      <td>${e.action}</td>
      <td>${e.notes || ''}</td>
      <td><button class="btn danger outline">Delete</button></td>
    `;
    tr.querySelector('button').onclick = () => deleteEntry(e.id);
    tableBody.appendChild(tr);
  });

  emptyState.style.display = rows.length ? 'none' : 'block';
}

function exportCSV() {
  let csv = 'Date,Name,Problem,Location,Action,Notes\n';
  logEntries.forEach(e => {
    const esc = (s='') => '"' + String(s).replace(/"/g,'""') + '"';
    csv += `${e.date},${esc(e.name)},${esc(e.problem)},${esc(e.location)},${esc(e.action)},${esc(e.notes)}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_log_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildReportHTML(entries) {
  const created = new Date().toLocaleString();
  const rows = entries.map((e, idx) => `
    <tr>
      <td>${idx+1}</td>
      <td>${e.date}</td>
      <td>${e.name || ''}</td>
      <td>${e.problem}</td>
      <td>${e.location}</td>
      <td>${e.action}</td>
      <td>${e.notes || ''}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inventory Error Report</title>
<style>
  body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:24px;color:#0f172a}
  h1{margin:0 0 4px}
  .muted{color:#64748b}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{border:1px solid #e5e7eb;padding:8px;text-align:left;vertical-align:top}
  th{background:#eef2ff}
  footer{margin-top:24px;color:#64748b}
</style>
</head>
<body>
  <h1>Inventory Error Report</h1>
  <div class="muted">Generated: ${created}</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Name</th>
        <th>Problem</th>
        <th>Location</th>
        <th>Action</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <footer>
    <p>Prepared automatically by Inventory Log. Attach this HTML file to email or open and print to PDF.</p>
  </footer>
</body>
</html>`;
}

function downloadReport(html) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `inventory_error_report_${stamp}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function updateReportPreview() {
  const latest12 = logEntries.slice(0,12).reverse();
  if (!latest12.length) {
    reportPreview.innerHTML = '<p class="muted">No entries yet.</p>';
    return;
  }
  reportPreview.innerHTML = latest12.map(e => `
    <div class="report-item">
      <div><strong>${e.date}</strong> <span class="badge">${e.name || ''}</span></div>
      <div><strong>Problem:</strong> ${e.problem}</div>
      <div><strong>Location:</strong> ${e.location}</div>
      <div><strong>Action:</strong> ${e.action}</div>
      ${e.notes ? `<div><strong>Notes:</strong> ${e.notes}</div>` : ''}
    </div>
  `).join('');
}

// Events
form.addEventListener('submit', e => {
  e.preventDefault();

  const problemValue = problemSelect.value === 'Other'
    ? (problemOther.value || 'Other').trim()
    : problemSelect.value;

  const actionValue = actionSelect.value === 'Other'
    ? (actionOther.value || 'Other').trim()
    : actionSelect.value;

  addEntry({
    date: dateEl.value,
    name: nameEl.value.trim(),
    problem: problemValue,
    location: locationEl.value.trim(),
    action: actionValue,
    notes: notesEl.value.trim()
  });

  form.reset();
  setToday();
  problemOther.style.display = 'none';
  actionOther.style.display = 'none';
});

exportBtn.addEventListener('click', exportCSV);
clearBtn.addEventListener('click', clearAll);
searchEl.addEventListener('input', render);
reportBtn.addEventListener('click', () => {
  const latest12 = logEntries.slice(0, 12).reverse();
  if (!latest12.length) {
    alert('No entries yet to include in the report.');
    return;
  }
  const html = buildReportHTML(latest12);
  downloadReport(html);
});
