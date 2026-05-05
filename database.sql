-- ╔══════════════════════════════════════╗
-- ║   LIBRARY MANAGEMENT SYSTEM - SQL   ║
-- ║   Run this in phpMyAdmin             ║
-- ╚══════════════════════════════════════╝

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- ─── BOOKS TABLE ───
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publisher VARCHAR(100),
    genre VARCHAR(50),
    year YEAR,
    total_copies INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MEMBERS TABLE ───
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    department VARCHAR(100),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── BOOK ISSUES TABLE ───
CREATE TABLE IF NOT EXISTS book_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id VARCHAR(20) UNIQUE NOT NULL,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status ENUM('issued', 'returned') DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- ─── SAMPLE DATA ───
INSERT INTO books (book_id, title, author, publisher, genre, year, total_copies) VALUES
('BK001', 'The Alchemist', 'Paulo Coelho', 'HarperCollins', 'Fiction', 1988, 3),
('BK002', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 'Technology', 2008, 2),
('BK003', 'Sapiens', 'Yuval Noah Harari', 'Harper', 'History', 2011, 4),
('BK004', 'Atomic Habits', 'James Clear', 'Avery', 'Self-Help', 2018, 3),
('BK005', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 'Classic', 1925, 2),
('BK006', 'Design Patterns', 'Gang of Four', 'Addison Wesley', 'Technology', 1994, 2);

INSERT INTO members (member_id, name, email, phone, department, address) VALUES
('MEM001', 'Arjun Kumar', 'arjun@college.edu', '9876543210', 'Computer Science', 'Chennai'),
('MEM002', 'Priya Sharma', 'priya@college.edu', '9876543211', 'Electronics', 'Coimbatore'),
('MEM003', 'Ravi Prasad', 'ravi@college.edu', '9876543212', 'Mechanical', 'Bangalore'),
('MEM004', 'Kavitha Nair', 'kavitha@college.edu', '9876543213', 'Civil', 'Kochi');

INSERT INTO book_issues (issue_id, book_id, member_id, issue_date, due_date, status) VALUES
('ISS0001', 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'issued'),
('ISS0002', 2, 2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'issued'),
('ISS0003', 3, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'issued');
