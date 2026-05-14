<?php
session_start();
require 'db.php';

if (isset($_SESSION['user_id']) && isset($_GET['id'])) {
    $projId = $_GET['id'];
    $userId = $_SESSION['user_id'];

    try {
        $sql = "DELETE FROM projects WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$projId, $userId]);
        
        // الكلمة دي بس هي اللي بترجع للجافاسكريبت
        echo "success"; 
    } catch(PDOException $e) {
        echo "DB Error: " . $e->getMessage();
    }
} else {
    echo "Session Error: User not logged in or ID missing";
}
?>