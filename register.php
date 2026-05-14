<?php
session_start();
require '../db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $bday = $_POST['bday'];

    try {
        // 1. نتأكد إن الإيميل مش متسجل قبل كده
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo "Error: This email is already registered. Please log in!";
            exit();
        }

        // 2. نتأكد إن الاسم مش متاخد
        $stmt = $pdo->prepare("SELECT id FROM users WHERE full_name = ?");
        $stmt->execute([$name]);
        if ($stmt->fetch()) {
            echo "Error: Username already exists! Please choose a different name.";
            exit();
        }

        // 3. لو كله تمام، نسجل اليوزر الجديد في الداتابيز
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (full_name, email, password_hash, dob, role, status) VALUES (?, ?, ?, ?, 'guest', 'active')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $hashed_password, $bday]);

        // new user id
        $newUserId = $pdo->lastInsertId();

     
        session_unset(); // بيمسح أي بيانات قديمة متعلقة في المتصفح
        session_regenerate_id(true); // بيعمل (ID) جديد نوفي للسيشن عشان الأمان

        // نسجل بيانات اليوزر الجديد النضيفة
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $newUserId;
        $_SESSION['user_name'] = $name;
        $_SESSION['role'] = 'guest'; // أو user حسب ما إنت مسميها
        
        // 5. نسجل الحركة في لوحة الأدمين إن في يوزر جديد دخل
        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action_type, action_desc, icon) VALUES (?, 'new', ?, 'fa-user-plus')");
        $logStmt->execute([$newUserId, "New user registered: $name"]);

        // نبعت الكلمة السحرية للجافاسكريبت عشان يطير بيه على الداشبورد
        echo "success_user"; 
        
    } catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>