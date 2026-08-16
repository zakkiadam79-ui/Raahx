<?php
declare(strict_types=1);

final class Database
{
    public static function connect(array $config): PDO
    {
        $db = $config['db'] ?? [];
        $host = (string) ($db['host'] ?? '');
        $port = (int) ($db['port'] ?? 3306);
        $name = (string) ($db['name'] ?? '');
        $user = (string) ($db['user'] ?? '');
        $password = (string) ($db['password'] ?? '');

        if ($host === '' || $name === '' || $user === '') {
            throw new ApiException(500, 'DATABASE_NOT_CONFIGURED', 'The API database is not configured.');
        }

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name);

        try {
            $pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $pdo->exec('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
            return $pdo;
        } catch (PDOException $exception) {
            throw new ApiException(500, 'DATABASE_UNAVAILABLE', 'The API database is temporarily unavailable.', $exception);
        }
    }
}
