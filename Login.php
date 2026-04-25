<?php
session_start();

$db = new mysqli("localhost", "root", "", "smart_design_db");

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $db->real_escape_string($_POST['email']);
    $password = $_POST['password'];

    $sql = "SELECT id FROM users WHERE email = '$email' AND password = '$password'";
    $result = $db->query($sql);

    if ($result->num_rows > 0) {
        $_SESSION['loggedin'] = true;
        header("location: dashboard.php");
    } else {
        echo "<script>alert('Invalid Email or Password');</script>";
    }
}
?>