<?php
session_start();
header('Content-Type: application/json');

require 'db.php'; 

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['user_id'])) {
    $userId = $data['user_id'];
    
    try {
        // حماية: عشان الأدمين مايمسحش الأكاونت بتاعه بالغلط!
        if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $userId) {
            echo json_encode(["error" => "You cannot delete your own admin account!"]);
            exit;
        }

        // مسح اليوزر (عشان إحنا عاملين ON DELETE CASCADE في الداتابيز، مشاريعه كمان هتتمسح معاه أوتوماتيك)
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        // تسجيل الحركة في الـ Activity Log
        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action_type, action_desc, icon) VALUES (NULL, 'del', ?, 'fa-user-minus')");
        $logStmt->execute(["Admin deleted user #$userId"]);

        echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
    } catch(PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "No user ID provided"]);
}
?>