<?php
session_start();
header('Content-Type: application/json');

// استدعاء ملف الاتصال بقاعدة البيانات الخاص بك
require 'db.php'; 

try {
    $response = [];

    // 1. الإحصائيات (Stats)
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $response['stats']['total_users'] = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM projects");
    $response['stats']['total_projects'] = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'");
    $response['stats']['active_users'] = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $response['stats']['total_admins'] = $stmt->fetchColumn();

    // 2. سحب بيانات المستخدمين 
    $stmt = $pdo->query("
        SELECT u.id, u.full_name as name, u.email, u.role, u.status, DATE(u.created_at) as joined, 
               (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as projects
        FROM users u 
        ORDER BY u.created_at DESC
    ");
    $response['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // تلوين الأفاتارز
    $colors = ['#5D4037','#D4AF37','#3E2723','#8D6E63','#795548'];
    foreach($response['users'] as $key => $u) {
        $response['users'][$key]['color'] = $colors[$u['id'] % count($colors)];
    }

    // 3. سحب بيانات المشاريع
    $stmt = $pdo->query("
        SELECT p.id, u.full_name as owner, p.room_type as room, p.project_name, p.created_at 
        FROM projects p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
    ");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $emojis = ['office' => '🖥️', 'living_room' => '🛋️', 'bedroom' => '🛏️'];
    $bgs    = ['office' => '#EBE5DC', 'living_room' => '#E8DDD0', 'bedroom' => '#EDE8E0'];
    
    foreach($projects as $key => $p) {
        $room = strtolower($p['room']);
        $projects[$key]['emoji'] = $emojis[$room] ?? '🏠';
        $projects[$key]['bg']    = $bgs[$room] ?? '#EBE5DC';
        $projects[$key]['room']  = ucfirst(str_replace('_', ' ', $room));
        $projects[$key]['size']  = 'Custom'; 
    }
    $response['projects'] = $projects;

    // 4. سحب سجل النشاطات
    $stmt = $pdo->query("SELECT action_type as type, icon, action_desc as text, DATE_FORMAT(created_at, '%h:%i %p') as time FROM activity_log ORDER BY created_at DESC LIMIT 20");
    $response['activities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch(PDOException $e) {
    // لو حصل أي خطأ هيطبعلنا رسالة توضحه
    echo json_encode(['error' => $e->getMessage()]);
}
?>