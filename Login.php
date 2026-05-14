<?php
session_start();
require '../db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    try {
        $sql = "SELECT id, full_name, password_hash, role, status FROM users WHERE email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // الإيميل موجود في الداتابيز.. نتأكد من الباسورد بقى
            if (password_verify($password, $user['password_hash'])) {
                
                // حماية البلوك
                if (isset($user['status']) && $user['status'] === 'blocked') {
                    echo "Error: Your account has been blocked by the admin!";
                    exit();
                }

                $_SESSION['loggedin'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['role'] = $user['role']; 
                
                if ($user['role'] === 'admin') {
                    echo "success_admin"; 
                } else {
                    echo "success_user"; 
                }
            } else {
                // الإيميل صح بس الباسورد غلط
                echo "Error: Wrong password, please try again!";
            }
        } else {
            // الإيميل مش موجود أصلاً في الداتابيز
            echo "Error: No account exists with this email. Please sign up!";
        }
    } catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>