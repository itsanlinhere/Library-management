// ─── NAVIGATION ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`[data-page="${id}"]`).classList.add('active');

  const titles = {
    'page-dashboard': '📚 Dashboard',
    'page-books': '📖 Book Catalog',
    'page-members': '👥 Members',
    'page-issue': '🔄 Issue / Return',
    'page-overdue': '⚠️ Overdue Books'
  };
  document.querySelector('.topbar-title').textContent = titles[id] || 'Library';
}

// ─── MODAL ───
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  clearAlerts();
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    clearAlerts();
  }
});

// ─── ALERTS ───
function showAlert(type, msg) {
  clearAlerts();
  const div = document.createElement('div');
  div.className = `alert alert-${type} show`;
  div.textContent = msg;
  const modal = document.querySelector('.modal-overlay.open .modal');
  if (modal) modal.insertBefore(div, modal.firstChild);
}
function clearAlerts() {
  document.querySelectorAll('.alert').forEach(a => a.remove());
}

// ─── API HELPER ───
async function api(action, data = {}) {
  const fd = new FormData();
  fd.append('action', action);
  for (const [k, v] of Object.entries(data)) fd.append(k, v);
  const res = await fetch('php/handler.php', { method: 'POST', body: fd });
  return res.json();
}

// ─── BOOKS ───
async function loadBooks(search = '') {
  const data = await api('get_books', { search });
  const tbody = document.getElementById('books-tbody');
  if (!data.books || data.books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No books found 📚</td></tr>`;
    return;
  }
  tbody.innerHTML = data.books.map(b => `
    <tr>
      <td><strong>${esc(b.book_id)}</strong></td>
      <td>
        <div style="font-weight:500">${esc(b.title)}</div>
        <div style="font-size:12px;color:var(--muted);">${esc(b.genre)}</div>
      </td>
      <td>${esc(b.author)}</td>
      <td>${esc(b.publisher)}</td>
      <td>${esc(b.year)}</td>
      <td><span class="badge badge-${b.available_copies > 0 ? 'available' : 'issued'}">${b.available_copies > 0 ? b.available_copies + ' Available' : 'All Issued'}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editBook(${JSON.stringify(b).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBook(${b.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('books-search').addEventListener('input', e => loadBooks(e.target.value));

document.getElementById('add-book-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const d = Object.fromEntries(fd);
  const res = await api(d.book_id_hidden ? 'update_book' : 'add_book', d);
  if (res.success) {
    showAlert('success', res.message || 'Book saved!');
    setTimeout(() => { closeModal('modal-book'); loadBooks(); loadDashboard(); }, 1000);
  } else showAlert('error', res.message || 'Error occurred');
});

function openAddBook() {
  document.getElementById('add-book-form').reset();
  document.getElementById('book-modal-title').textContent = 'Add New Book';
  document.getElementById('book_id_hidden').value = '';
  openModal('modal-book');
}

function editBook(b) {
  document.getElementById('book-modal-title').textContent = 'Edit Book';
  const f = document.getElementById('add-book-form');
  f.title.value = b.title;
  f.author.value = b.author;
  f.publisher.value = b.publisher;
  f.genre.value = b.genre;
  f.year.value = b.year;
  f.total_copies.value = b.total_copies;
  f.book_id.value = b.book_id;
  document.getElementById('book_id_hidden').value = b.id;
  openModal('modal-book');
}

async function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  const res = await api('delete_book', { id });
  if (res.success) { loadBooks(); loadDashboard(); }
  else alert(res.message);
}

// ─── MEMBERS ───
async function loadMembers(search = '') {
  const data = await api('get_members', { search });
  const tbody = document.getElementById('members-tbody');
  if (!data.members || data.members.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No members found 👥</td></tr>`;
    return;
  }
  tbody.innerHTML = data.members.map(m => `
    <tr>
      <td><strong>${esc(m.member_id)}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--warm-brown);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:500;flex-shrink:0">
            ${m.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight:500">${esc(m.name)}</div>
            <div style="font-size:12px;color:var(--muted)">${esc(m.email)}</div>
          </div>
        </div>
      </td>
      <td>${esc(m.phone)}</td>
      <td>${esc(m.department)}</td>
      <td><span class="badge badge-${m.status === 'active' ? 'active' : 'inactive'}">${m.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editMember(${JSON.stringify(m).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('members-search').addEventListener('input', e => loadMembers(e.target.value));

document.getElementById('add-member-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const d = Object.fromEntries(fd);
  const res = await api(d.member_id_hidden ? 'update_member' : 'add_member', d);
  if (res.success) {
    showAlert('success', res.message || 'Member saved!');
    setTimeout(() => { closeModal('modal-member'); loadMembers(); loadDashboard(); }, 1000);
  } else showAlert('error', res.message || 'Error occurred');
});

function openAddMember() {
  document.getElementById('add-member-form').reset();
  document.getElementById('member-modal-title').textContent = 'Add New Member';
  document.getElementById('member_id_hidden').value = '';
  openModal('modal-member');
}

function editMember(m) {
  document.getElementById('member-modal-title').textContent = 'Edit Member';
  const f = document.getElementById('add-member-form');
  f.name.value = m.name;
  f.email.value = m.email;
  f.phone.value = m.phone;
  f.department.value = m.department;
  f.address.value = m.address;
  f.member_id.value = m.member_id;
  document.getElementById('member_id_hidden').value = m.id;
  openModal('modal-member');
}

async function deleteMember(id) {
  if (!confirm('Delete this member?')) return;
  const res = await api('delete_member', { id });
  if (res.success) { loadMembers(); loadDashboard(); }
  else alert(res.message);
}

// ─── ISSUE BOOK ───
async function loadIssuedBooks() {
  const data = await api('get_issued');
  const tbody = document.getElementById('issued-tbody');
  if (!data.issued || data.issued.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No books currently issued 📖</td></tr>`;
    return;
  }
  tbody.innerHTML = data.issued.map(i => `
    <tr>
      <td><strong>${esc(i.issue_id)}</strong></td>
      <td>${esc(i.book_title)}</td>
      <td>${esc(i.member_name)}</td>
      <td>${formatDate(i.issue_date)}</td>
      <td>${formatDate(i.due_date)}</td>
      <td>
        <span class="badge badge-${i.status === 'overdue' ? 'overdue' : i.status === 'returned' ? 'active' : 'issued'}">
          ${i.status}
        </span>
      </td>
      <td>
        ${i.status !== 'returned' ? `<button class="btn btn-gold btn-sm" onclick="returnBook(${i.id})">Return</button>` : '<span style="color:var(--muted);font-size:13px">Returned</span>'}
      </td>
    </tr>
  `).join('');
}

document.getElementById('issue-book-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await api('issue_book', Object.fromEntries(fd));
  if (res.success) {
    showAlert('success', 'Book issued successfully!');
    setTimeout(() => { closeModal('modal-issue'); loadIssuedBooks(); loadDashboard(); loadOverdue(); }, 1000);
  } else showAlert('error', res.message || 'Error issuing book');
});

async function returnBook(id) {
  if (!confirm('Confirm book return?')) return;
  const res = await api('return_book', { id });
  if (res.success) { loadIssuedBooks(); loadDashboard(); loadOverdue(); }
  else alert(res.message);
}

// ─── OVERDUE ───
async function loadOverdue() {
  const data = await api('get_overdue');
  const tbody = document.getElementById('overdue-tbody');
  const badge = document.getElementById('overdue-badge');
  if (!data.overdue || data.overdue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No overdue books ✅</td></tr>`;
    badge.textContent = '0';
    return;
  }
  badge.textContent = data.overdue.length;
  tbody.innerHTML = data.overdue.map(o => `
    <tr>
      <td>${esc(o.book_title)}</td>
      <td>${esc(o.member_name)}</td>
      <td>${esc(o.member_id)}</td>
      <td>${formatDate(o.issue_date)}</td>
      <td><strong style="color:#9B2335">${formatDate(o.due_date)}</strong></td>
      <td><span style="color:#9B2335;font-weight:500">${o.days_overdue} days</span></td>
    </tr>
  `).join('');
}

// ─── DASHBOARD ───
async function loadDashboard() {
  const data = await api('get_stats');
  if (data.stats) {
    document.getElementById('stat-books').textContent = data.stats.total_books;
    document.getElementById('stat-members').textContent = data.stats.total_members;
    document.getElementById('stat-issued').textContent = data.stats.issued_books;
    document.getElementById('stat-overdue').textContent = data.stats.overdue_books;
  }

  const recent = await api('get_recent');
  if (recent.recent) {
    const el = document.getElementById('recent-issues');
    el.innerHTML = recent.recent.length === 0
      ? '<p style="color:var(--muted);font-size:14px;padding:16px">No recent activity</p>'
      : recent.recent.map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--parchment);">
          <div>
            <div style="font-size:14px;font-weight:500">${esc(r.book_title)}</div>
            <div style="font-size:12px;color:var(--muted)">${esc(r.member_name)} · ${formatDate(r.issue_date)}</div>
          </div>
          <span class="badge badge-${r.status === 'overdue' ? 'overdue' : r.status === 'returned' ? 'active' : 'issued'}">${r.status}</span>
        </div>
      `).join('');
  }
}

// ─── POPULATE MEMBER/BOOK DROPDOWNS ───
async function populateDropdowns() {
  const books = await api('get_books_available');
  const members = await api('get_members_active');

  const bSel = document.getElementById('issue-book-select');
  bSel.innerHTML = '<option value="">Select a book...</option>' +
    (books.books || []).map(b => `<option value="${b.id}">[${esc(b.book_id)}] ${esc(b.title)} (${b.available_copies} left)</option>`).join('');

  const mSel = document.getElementById('issue-member-select');
  mSel.innerHTML = '<option value="">Select a member...</option>' +
    (members.members || []).map(m => `<option value="${m.id}">[${esc(m.member_id)}] ${esc(m.name)}</option>`).join('');
}

// ─── UTILS ───
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadBooks();
  loadMembers();
  loadIssuedBooks();
  loadOverdue();
  populateDropdowns();

  document.getElementById('modal-issue').addEventListener('click', e => {
    if (e.target.id === 'modal-issue') closeModal('modal-issue');
  });
});
