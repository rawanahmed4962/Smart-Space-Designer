<?php
// إعدادات السيرفر وقاعدة البيانات
$host = 'localhost';
$dbname = 'smart_design_db';
$username = 'root'; // اليوزر الافتراضي بتاع XAMPP
$password = ''; // الباسورد الافتراضي بيكون فاضي

try {
    // محاولة الاتصال بقاعدة البيانات
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // تفعيل خاصية إظهار الأخطاء
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // هنطبع الرسالة دي عشان نتأكد إنه شغال
    //echo "connected!"; 
    
} catch(PDOException $e) {
    // لو حصل مشكلة هيطبع الخطأ
    die("Error: " . $e->getMessage());
}
?>