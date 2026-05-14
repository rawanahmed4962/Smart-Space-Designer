<?php
session_start();
header('Content-Type: application/json');

require 'db.php'; // تأكد إن ده مسار ملف الداتابيز الصح

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['user_id'])) {
    $userId = $data['user_id'];
    $desc = "";
    
    try {
        // لو الأدمين بيغير رتبة حد
        if (isset($data['role'])) {
            $newRole = $data['role'];
            $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$newRole, $userId]);
            $desc = "Changed user #$userId role to $newRole";
        }
        
        // لو الأدمين بيدي حد بلوك أو بيفكه
        if (isset($data['status'])) {
            $newStatus = $data['status'];
            $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $userId]);
            $desc = "Changed user #$userId status to $newStatus";
        }

        // تسجيل الحركة في الـ Activity Log
        if ($desc !== "") {
            $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action_type, action_desc, icon) VALUES (NULL, 'edit_user', ?, 'fa-user-shield')");
            $logStmt->execute([$desc]);
        }

        echo json_encode(["status" => "success", "message" => "Updated successfully!"]);
    } catch(PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "No user ID provided"]);
}
?>