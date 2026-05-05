# 📚 Library Management System 

## 🗂️ Project Structure
```
library_management/
├── index.html          ← Main frontend (open this in browser)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── app.js          ← Frontend logic (CRUD, API calls)
├── php/
│   └── handler.php     ← PHP backend (all DB operations)
└── database.sql        ← Run this in phpMyAdmin first!
```

## ⚙️ Setup Steps (XAMPP)

### Step 1 — Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL**

### Step 2 — Create Database
- Open browser → go to `http://localhost/phpmyadmin`
- Click **New** → Create database named `library_db`
- Click the database → go to **SQL** tab
- Paste the contents of `database.sql` → Click **Go**

### Step 3 — Copy Project Files
- Copy the entire `library_management` folder to:
  - **Windows:** `C:\xampp\htdocs\library_management`
  - **Mac:** `/Applications/XAMPP/htdocs/library_management`

### Step 4 — Open the App
- Go to: `http://localhost/library_management/index.html`
- Done! 🎉

## 🔐 DB Config
If your MySQL has a password, edit `php/handler.php`:
```php
$user = 'root';
$pass = 'your_password_here';  // change this
```

## ✅ Features
- 📊 **Dashboard** — Stats & recent activity
- 📖 **Books** — Add, Edit, Delete, Search
- 👥 **Members** — Register & manage members
- 🔄 **Issue / Return** — Issue books, track returns
- ⚠️ **Overdue** — See all overdue books with days count
- 🔍 **Search** — Live search in books & members

## 📝 Tables
| Table | Purpose |
|-------|---------|
| `books` | Book catalog with copies |
| `members` | Registered library members |
| `book_issues` | Issue/return transaction log |
