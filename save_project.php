<?php
session_start();
require 'db.php'; 

// استقبال البيانات وتحويلها من JSON لمصفوفة PHP
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo "Error: No data received";
    exit;
}

// 1. استخراج البيانات الأساسية
$projId      = isset($data['projId']) ? $data['projId'] : null;
$projectName = $data['projectName'];
$roomType    = $data['roomType']; // ده اللي كان بيسيف غلط، دلوقتي هيتقرأ صح
$description = $data['description'];
$userId      = $_SESSION['user_id'];

// 2. تجميع بيانات الـ 3D كلها (مقاسات + عفش) في عمود واحد اسمه scene_data
$sceneArray = [
    "roomSettings" => $data['roomSettings'],
    "furniture"    => $data['furniture']
];
$sceneData = json_encode($sceneArray);

try {
    if ($projId && $projId !== "") {
        // --- حالة التحديث (Update) ---
        $sql = "UPDATE projects SET 
                project_name = ?, 
                room_type = ?, 
                description = ?, 
                scene_data = ? 
                WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$projectName, $roomType, $description, $sceneData, $projId, $userId]);
        echo "success";
    } else {
        // --- حالة إنشاء مشروع جديد (Insert) ---
        $sql = "INSERT INTO projects (user_id, project_name, room_type, description, scene_data) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $projectName, $roomType, $description, $sceneData]);
        
        // بنرجع الـ ID الجديد عشان الـ JS يعرفه
        $newId = $pdo->lastInsertId();
        echo "success_new:" . $newId;
    }
} catch (PDOException $e) {
    // لو طلع إيرور هيقولك سببه إيه بالظبط (مثلاً اسم عمود غلط)
    echo "Database Error: " . $e->getMessage();
}
?>