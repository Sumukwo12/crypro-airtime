<?php
require_once 'config.php';

class Database {
    private $conn;
    
    public function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function query($sql, $params = []) {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public function select($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function selectOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        
        $this->query($sql, array_values($data));
        return $this->conn->lastInsertId();
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        $setClauses = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            $setClauses[] = "$key = ?";
            $params[] = $value;
        }
        
        $setClause = implode(', ', $setClauses);
        
        $sql = "UPDATE $table SET $setClause WHERE $where";
        
        $this->query($sql, array_merge($params, $whereParams));
    }
    
    public function getSetting($key) {
        $result = $this->selectOne("SELECT setting_value FROM settings WHERE setting_key = ?", [$key]);
        return $result ? $result['setting_value'] : null;
    }
    
    public function updateSetting($key, $value) {
        $existing = $this->selectOne("SELECT id FROM settings WHERE setting_key = ?", [$key]);
        
        if ($existing) {
            $this->update('settings', ['setting_value' => $value], 'setting_key = ?', [$key]);
        } else {
            $this->insert('settings', [
                'setting_key' => $key,
                'setting_value' => $value
            ]);
        }
    }
}

// Create database instance
$db = new Database();

