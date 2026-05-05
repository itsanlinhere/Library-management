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

### 📊 Dashboard
- Displays live statistics such as total books, members, issued books, and overdue books.
- Shows recent activities like newly added books, issued books, and returned books.

### 📚 Books Management
- Add new books with details such as title, author, category, and quantity.
- Edit existing book details.
- Delete unwanted book records.
- Search books instantly using live search.
- Track available and issued copies of each book.

### 👥 Members Management
- Register new library members.
- Store member details including name, department, contact number, and email.
- Edit or remove member records.
- Search members quickly.

### 🔄 Issue & Return Management
- Issue books to registered members.
- Automatically sets a 14-day due date from the issue date.
- Return books and update availability automatically.

### ⚠️ Overdue Tracker
- Identifies overdue books automatically.
- Displays overdue days count for each delayed return.

### 🔍 Live Search
- Real-time search functionality for both books and members.

## 📝 Tables
| Table | Purpose |
|-------|---------|
| `books` | Book catalog with copies |
| `members` | Registered library members |
| `book_issues` | Issue/return transaction log |
