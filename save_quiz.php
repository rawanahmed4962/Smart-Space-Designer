<?php
session_start();
require '../db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    $style = $_POST['style'];
    $userId = $_SESSION['user_id'];

    try {
        $sql = "UPDATE users SET preferred_style = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$style, $userId]);
        echo "success";
    } catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>