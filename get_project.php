<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

if(isset($_GET['id']) && isset($_SESSION['user_id'])) {
    // علامة النجمة دي هتجيب الاسم والوصف والعفش وكل حاجة
    $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?");
    $stmt->execute([$_GET['id'], $_SESSION['user_id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($result) {
        echo json_encode($result);
    } else {
        echo json_encode(["error" => "Project not found"]);
    }
}
?>