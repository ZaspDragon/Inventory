const STORAGE_KEY = 'inventoryLog.v1';
let logEntries = [];

const form = document.getElementById('logForm');
const dateEl = document.getElementById('date');
const problemEl = document.getElementById('problem');
const locationEl = document.getElementById('location');
const actionEl = document.getElementById('action');
const notesEl = document.getElementById('notes');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const tableBody = document.querySelector('#logTable tbody');
const emptyState = document.getElementById('emptyState');
const searchEl = document.getElementById('search');

setToday();
loadEntries();
render();

function setToday() {
  const today = new Date();
  dateEl.value = today.toISOString().slice(0,10);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logEntries));
}

function loadEntries() {
  logEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function addEntry(entry) {
  logEntries.unshift({ id: crypto.randomUUID(), ...entry });
  save();
  render();
}

function deleteEntry(id) {
  logEntries = logEntries.filter(e => e.id !== id);
  save();
  render();
}

function clearAll() {
  if (confirm('Clear ALL saved entries?')) {
    logEntries = [];
    save();
    render();
  }
}

function render() {
  const q = searchEl.value.toLowerCase();
  const rows = logEntries.filter(e =>
    [e.date, e.problem, e.location, e.action, e.notes]
      .join(' ').toLowerCase().includes(q)
  );

  tableBody.innerHTML = '';
  rows.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
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
  let csv = "Date,Problem,Location,Action,Notes\n";
  logEntries.forEach(e => {
    csv += `${e.date},"${e.problem}","${e.location}","${e.action}","${e.notes}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "inventory_log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  addEntry({
    date: dateEl.value,
    problem: problemEl.value.trim(),
    location: locationEl.value.trim(),
    action: actionEl.value.trim(),
    notes: notesEl.value.trim()
  });
  form.reset();
  setToday();
});
exportBtn.addEventListener('click', exportCSV);
clearBtn.addEventListener('click', clearAll);
searchEl.addEventListener('input', render);