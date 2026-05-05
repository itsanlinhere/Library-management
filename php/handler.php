<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ─── DB CONFIG ───
$host = 'localhost';
$dbname = 'library_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'DB Connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // ─── STATS ───
    case 'get_stats':
        $stats = [];
        $stats['total_books']    = $pdo->query("SELECT SUM(total_copies) FROM books")->fetchColumn() ?: 0;
        $stats['total_members']  = $pdo->query("SELECT COUNT(*) FROM members WHERE status='active'")->fetchColumn() ?: 0;
        $stats['issued_books']   = $pdo->query("SELECT COUNT(*) FROM book_issues WHERE status='issued'")->fetchColumn() ?: 0;
        $stats['overdue_books']  = $pdo->query("SELECT COUNT(*) FROM book_issues WHERE status='issued' AND due_date < CURDATE()")->fetchColumn() ?: 0;
        echo json_encode(['stats' => $stats]);
        break;

    // ─── RECENT ISSUES ───
    case 'get_recent':
        $stmt = $pdo->query("
            SELECT bi.*, b.title AS book_title, m.name AS member_name,
                   CASE WHEN bi.status='issued' AND bi.due_date < CURDATE() THEN 'overdue'
                        ELSE bi.status END AS status
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.id
            JOIN members m ON bi.member_id = m.id
            ORDER BY bi.issue_date DESC LIMIT 8
        ");
        echo json_encode(['recent' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    // ─── BOOKS ───
    case 'get_books':
        $search = '%' . ($_POST['search'] ?? '') . '%';
        $stmt = $pdo->prepare("
            SELECT b.*,
                   (b.total_copies - COALESCE((SELECT COUNT(*) FROM book_issues WHERE book_id=b.id AND status='issued'),0)) AS available_copies
            FROM books b
            WHERE b.title LIKE ? OR b.author LIKE ? OR b.book_id LIKE ? OR b.genre LIKE ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$search, $search, $search, $search]);
        echo json_encode(['books' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'get_books_available':
        $stmt = $pdo->query("
            SELECT b.id, b.book_id, b.title,
                   (b.total_copies - COALESCE((SELECT COUNT(*) FROM book_issues WHERE book_id=b.id AND status='issued'),0)) AS available_copies
            FROM books b
            HAVING available_copies > 0
            ORDER BY b.title
        ");
        echo json_encode(['books' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'add_book':
        $stmt = $pdo->prepare("INSERT INTO books (book_id, title, author, publisher, genre, year, total_copies) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([
            $_POST['book_id'], $_POST['title'], $_POST['author'],
            $_POST['publisher'], $_POST['genre'], $_POST['year'], $_POST['total_copies']
        ]);
        echo json_encode(['success' => true, 'message' => 'Book added successfully!']);
        break;

    case 'update_book':
        $stmt = $pdo->prepare("UPDATE books SET book_id=?, title=?, author=?, publisher=?, genre=?, year=?, total_copies=? WHERE id=?");
        $stmt->execute([
            $_POST['book_id'], $_POST['title'], $_POST['author'],
            $_POST['publisher'], $_POST['genre'], $_POST['year'],
            $_POST['total_copies'], $_POST['book_id_hidden']
        ]);
        echo json_encode(['success' => true, 'message' => 'Book updated!']);
        break;

    case 'delete_book':
        $check = $pdo->prepare("SELECT COUNT(*) FROM book_issues WHERE book_id=? AND status='issued'");
        $check->execute([$_POST['id']]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Cannot delete: book is currently issued!']);
            break;
        }
        $pdo->prepare("DELETE FROM books WHERE id=?")->execute([$_POST['id']]);
        echo json_encode(['success' => true, 'message' => 'Book deleted']);
        break;

    // ─── MEMBERS ───
    case 'get_members':
        $search = '%' . ($_POST['search'] ?? '') . '%';
        $stmt = $pdo->prepare("SELECT * FROM members WHERE name LIKE ? OR email LIKE ? OR member_id LIKE ? OR department LIKE ? ORDER BY created_at DESC");
        $stmt->execute([$search, $search, $search, $search]);
        echo json_encode(['members' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'get_members_active':
        $stmt = $pdo->query("SELECT id, member_id, name FROM members WHERE status='active' ORDER BY name");
        echo json_encode(['members' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'add_member':
        $stmt = $pdo->prepare("INSERT INTO members (member_id, name, email, phone, department, address) VALUES (?,?,?,?,?,?)");
        $stmt->execute([
            $_POST['member_id'], $_POST['name'], $_POST['email'],
            $_POST['phone'], $_POST['department'], $_POST['address']
        ]);
        echo json_encode(['success' => true, 'message' => 'Member added successfully!']);
        break;

    case 'update_member':
        $stmt = $pdo->prepare("UPDATE members SET member_id=?, name=?, email=?, phone=?, department=?, address=? WHERE id=?");
        $stmt->execute([
            $_POST['member_id'], $_POST['name'], $_POST['email'],
            $_POST['phone'], $_POST['department'], $_POST['address'],
            $_POST['member_id_hidden']
        ]);
        echo json_encode(['success' => true, 'message' => 'Member updated!']);
        break;

    case 'delete_member':
        $check = $pdo->prepare("SELECT COUNT(*) FROM book_issues WHERE member_id=? AND status='issued'");
        $check->execute([$_POST['id']]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Cannot delete: member has books issued!']);
            break;
        }
        $pdo->prepare("DELETE FROM members WHERE id=?")->execute([$_POST['id']]);
        echo json_encode(['success' => true, 'message' => 'Member deleted']);
        break;

    // ─── ISSUE / RETURN ───
    case 'get_issued':
        $stmt = $pdo->query("
            SELECT bi.*, b.title AS book_title, m.name AS member_name, m.member_id AS member_code,
                   CASE WHEN bi.status='issued' AND bi.due_date < CURDATE() THEN 'overdue'
                        ELSE bi.status END AS status
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.id
            JOIN members m ON bi.member_id = m.id
            ORDER BY bi.issue_date DESC
        ");
        echo json_encode(['issued' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'issue_book':
        // check availability
        $avail = $pdo->prepare("
            SELECT (b.total_copies - COALESCE((SELECT COUNT(*) FROM book_issues WHERE book_id=b.id AND status='issued'),0)) AS available
            FROM books b WHERE b.id=?
        ");
        $avail->execute([$_POST['book_id']]);
        $row = $avail->fetch(PDO::FETCH_ASSOC);
        if (!$row || $row['available'] <= 0) {
            echo json_encode(['success' => false, 'message' => 'No copies available!']);
            break;
        }
        $dueDate = date('Y-m-d', strtotime('+14 days'));
        $issueId = 'ISS' . str_pad(rand(1,9999), 4, '0', STR_PAD_LEFT);
        $stmt = $pdo->prepare("INSERT INTO book_issues (issue_id, book_id, member_id, issue_date, due_date, status) VALUES (?,?,?,CURDATE(),?,'issued')");
        $stmt->execute([$issueId, $_POST['book_id'], $_POST['member_id'], $dueDate]);
        echo json_encode(['success' => true, 'message' => 'Book issued! Due: ' . date('d M Y', strtotime($dueDate))]);
        break;

    case 'return_book':
        $stmt = $pdo->prepare("UPDATE book_issues SET status='returned', return_date=CURDATE() WHERE id=?");
        $stmt->execute([$_POST['id']]);
        echo json_encode(['success' => true, 'message' => 'Book returned successfully!']);
        break;

    // ─── OVERDUE ───
    case 'get_overdue':
        $stmt = $pdo->query("
            SELECT bi.*, b.title AS book_title, m.name AS member_name, m.member_id,
                   DATEDIFF(CURDATE(), bi.due_date) AS days_overdue
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.id
            JOIN members m ON bi.member_id = m.id
            WHERE bi.status='issued' AND bi.due_date < CURDATE()
            ORDER BY days_overdue DESC
        ");
        echo json_encode(['overdue' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    default:
        echo json_encode(['error' => 'Unknown action']);
}
?>
