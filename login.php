<?php
$servername = ""; // Or your DB host
$username = ""; // Replace with your DB username
$password = ""; // Replace with your DB password
$dbname = ""; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username = '$username' AND webPassword = '$password'"; // Basic - use prepared statements in production
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  echo json_encode(array("success" => true));
} else {
  echo json_encode(array("success" => false));
}

$conn->close();
?>