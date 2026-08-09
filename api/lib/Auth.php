<?php
declare(strict_types=1);

final class Auth
{
    private static array $loginAttempts = [];

    public static function login(PDO $pdo, array $config, string $providedSecret): void
    {
        $secretEnvName = (string) ($config['admin_secret_env'] ?? 'ADMIN_SECRET');
        $configuredSecret = getenv($secretEnvName);
        if ($configuredSecret === false || $configuredSecret === '') {
            throw new ApiException(503, 'AUTH_NOT_CONFIGURED', 'Authentication is not configured.');
        }

        self::checkLoginThrottle();

        $providedHash = hash('sha256', $providedSecret);
        $configuredHash = hash('sha256', $configuredSecret);
        if (!hash_equals($configuredHash, $providedHash)) {
            throw new ApiException(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
        }

        $existingHash = self::currentSessionHash($pdo, $config, false);
        if ($existingHash !== null) {
            $delete = $pdo->prepare('DELETE FROM admin_sessions WHERE session_token_hash = :session_token_hash');
            $delete->execute(['session_token_hash' => $existingHash]);
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $ttl = max(300, (int) ($config['session']['ttl_seconds'] ?? 28800));
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);

        $statement = $pdo->prepare(
            'INSERT INTO admin_sessions (session_token_hash, expires_at, ip_address, user_agent)
             VALUES (:session_token_hash, :expires_at, :ip_address, :user_agent)',
        );
        $statement->execute([
            'session_token_hash' => $tokenHash,
            'expires_at' => $expiresAt,
            'ip_address' => substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45) ?: null,
            'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 512) ?: null,
        ]);

        self::setCookie($config, $token, $ttl);
        self::$loginAttempts[self::clientKey()] = null;
    }

    public static function isAuthenticated(PDO $pdo, array $config): bool
    {
        return self::currentSessionHash($pdo, $config, true) !== null;
    }

    public static function requireAuthenticated(PDO $pdo, array $config): void
    {
        if (!self::isAuthenticated($pdo, $config)) {
            throw new ApiException(401, 'UNAUTHENTICATED', 'Authentication is required.');
        }
    }

    public static function logout(PDO $pdo, array $config): void
    {
        $sessionHash = self::currentSessionHash($pdo, $config, false);
        if ($sessionHash !== null) {
            $statement = $pdo->prepare('DELETE FROM admin_sessions WHERE session_token_hash = :session_token_hash');
            $statement->execute(['session_token_hash' => $sessionHash]);
        }

        self::clearCookie($config);
    }

    private static function currentSessionHash(PDO $pdo, array $config, bool $touch): ?string
    {
        $cookieName = (string) ($config['session']['cookie_name'] ?? 'raahx_php_session');
        $token = $_COOKIE[$cookieName] ?? '';
        if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/i', $token)) {
            return null;
        }

        $hash = hash('sha256', $token);
        $statement = $pdo->prepare(
            'SELECT session_token_hash FROM admin_sessions
             WHERE session_token_hash = :session_token_hash AND expires_at > NOW()
             LIMIT 1',
        );
        $statement->execute(['session_token_hash' => $hash]);
        if ($statement->fetchColumn() === false) {
            return null;
        }

        if ($touch) {
            $update = $pdo->prepare(
                'UPDATE admin_sessions SET last_seen_at = CURRENT_TIMESTAMP
                 WHERE session_token_hash = :session_token_hash',
            );
            $update->execute(['session_token_hash' => $hash]);
        }

        return $hash;
    }

    private static function setCookie(array $config, string $token, int $ttl): void
    {
        $secure = ($config['environment'] ?? 'development') === 'production';
        setcookie((string) ($config['session']['cookie_name'] ?? 'raahx_php_session'), $token, [
            'expires' => time() + $ttl,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    private static function clearCookie(array $config): void
    {
        $secure = ($config['environment'] ?? 'development') === 'production';
        setcookie((string) ($config['session']['cookie_name'] ?? 'raahx_php_session'), '', [
            'expires' => 1,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    private static function checkLoginThrottle(): void
    {
        $key = self::clientKey();
        $now = time();
        $windowSeconds = 900;
        $maxAttempts = 10;
        $attempt = self::$loginAttempts[$key] ?? null;

        if (!is_array($attempt) || $now - $attempt['started_at'] >= $windowSeconds) {
            self::$loginAttempts[$key] = ['started_at' => $now, 'count' => 1];
            return;
        }

        if ($attempt['count'] >= $maxAttempts) {
            throw new ApiException(429, 'TOO_MANY_ATTEMPTS', 'Too many login attempts. Try again later.');
        }

        self::$loginAttempts[$key]['count']++;
    }

    private static function clientKey(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }
}
