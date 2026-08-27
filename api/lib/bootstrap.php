<?php
declare(strict_types=1);

require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Validation.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/../resources/services.php';
require_once __DIR__ . '/../resources/team.php';
require_once __DIR__ . '/../resources/blogs.php';
require_once __DIR__ . '/../resources/case_studies.php';
require_once __DIR__ . '/../resources/creator_mail.php';
require_once __DIR__ . '/../resources/creator_brand_icons.php';
require_once __DIR__ . '/../resources/creator_private.php';
require_once __DIR__ . '/../resources/creators.php';
require_once __DIR__ . '/../resources/creator_access.php';
require_once __DIR__ . '/../resources/creator_applications.php';
require_once __DIR__ . '/../resources/creator_collaboration_requests.php';
require_once __DIR__ . '/../resources/creator_media.php';
require_once __DIR__ . '/../resources/subscribers.php';
require_once __DIR__ . '/../resources/proposals.php';
require_once __DIR__ . '/../resources/blog_views.php';
require_once __DIR__ . '/../resources/migration.php';

function raahx_env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
}

function raahx_bool(string|int|bool|null $value, bool $default = false): bool
{
    if ($value === null || $value === '') return $default;
    if (is_bool($value)) return $value;
    return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
}

function raahx_smtp_secure(int $port, string|int|bool|null $requested): bool
{
    if ($port === 465) return true;
    if ($port === 587) return false;
    return raahx_bool($requested, true);
}

function raahx_config(): array
{
    $config = [
        'environment' => raahx_env('APP_ENV', raahx_env('RAAHX_ENV', 'development')),
        'db' => [
            'host' => raahx_env('RAAHX_DB_HOST', '127.0.0.1'),
            'port' => (int) raahx_env('RAAHX_DB_PORT', '3306'),
            'name' => raahx_env('RAAHX_DB_NAME', ''),
            'user' => raahx_env('RAAHX_DB_USER', ''),
            'password' => raahx_env('RAAHX_DB_PASSWORD', ''),
        ],
        'allowed_origins' => array_values(array_filter(array_map(
            'trim',
            explode(',', raahx_env(
                'RAAHX_ALLOWED_ORIGINS',
                'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000',
            )),
        ), static fn (string $origin): bool => $origin !== '')),
        'admin_secret_env' => raahx_env('RAAHX_ADMIN_SECRET_ENV', 'ADMIN_SECRET'),
        'creator_pii_key_env' => raahx_env('RAAHX_CREATOR_PII_KEY_ENV', 'CREATOR_PII_KEY'),
        'session' => [
            'cookie_name' => raahx_env('RAAHX_SESSION_COOKIE', 'raahx_php_session'),
            'ttl_seconds' => (int) raahx_env('RAAHX_SESSION_TTL', '28800'),
        ],
        'app_url' => raahx_env('APP_URL', ''),
        'mail' => [
            'host' => raahx_env('SMTP_HOST', 'smtp.hostinger.com'),
            'port' => (int) raahx_env('SMTP_PORT', '465'),
            'secure' => raahx_smtp_secure(
                (int) raahx_env('SMTP_PORT', '465'),
                raahx_env('SMTP_SECURE', 'true'),
            ),
            'user' => raahx_env('SMTP_USER', 'hello@raahx.com'),
            'pass' => raahx_env('SMTP_PASS'),
            'from' => raahx_env('MAIL_FROM', 'hello@raahx.com'),
            'to' => raahx_env('MAIL_TO', 'hello@raahx.com'),
        ],
    ];

    $localConfigPath = __DIR__ . '/../config/config.php';
    if (is_file($localConfigPath)) {
        $localConfig = require $localConfigPath;
        if (is_array($localConfig)) {
            $config = array_replace_recursive($config, $localConfig);
            if (array_key_exists('allowed_origins', $localConfig) && is_array($localConfig['allowed_origins'])) {
                $config['allowed_origins'] = array_values(array_filter(
                    array_map('trim', $localConfig['allowed_origins']),
                    static fn (string $origin): bool => $origin !== '',
                ));
            }
        }
    }

    // Environment variables take precedence over an optional local config file.
    $environment = raahx_env('APP_ENV', raahx_env('RAAHX_ENV'));
    if ($environment !== null) {
        $config['environment'] = $environment;
    }

    foreach (['host' => 'RAAHX_DB_HOST', 'name' => 'RAAHX_DB_NAME', 'user' => 'RAAHX_DB_USER', 'password' => 'RAAHX_DB_PASSWORD'] as $key => $envKey) {
        $value = raahx_env($envKey);
        if ($value !== null) {
            $config['db'][$key] = $value;
        }
    }

    $port = raahx_env('RAAHX_DB_PORT');
    if ($port !== null) {
        $config['db']['port'] = (int) $port;
    }

    $origins = raahx_env('RAAHX_ALLOWED_ORIGINS');
    if ($origins !== null) {
        $config['allowed_origins'] = array_values(array_filter(array_map(
            'trim',
            explode(',', $origins),
        ), static fn (string $origin): bool => $origin !== ''));
    }

    $appUrl = raahx_env('APP_URL');
    if ($appUrl !== null) {
        $config['app_url'] = rtrim($appUrl, '/');
    }

    foreach (['host' => 'SMTP_HOST', 'user' => 'SMTP_USER', 'from' => 'MAIL_FROM', 'to' => 'MAIL_TO'] as $key => $envKey) {
        $value = raahx_env($envKey);
        if ($value !== null) {
            $config['mail'][$key] = $value;
        }
    }

    $smtpPassword = raahx_env('SMTP_PASS');
    if ($smtpPassword !== null) {
        $config['mail']['pass'] = $smtpPassword;
    }

    $smtpPort = raahx_env('SMTP_PORT');
    if ($smtpPort !== null) {
        $config['mail']['port'] = (int) $smtpPort;
    }

    $smtpSecure = raahx_env('SMTP_SECURE');
    $config['mail']['secure'] = raahx_smtp_secure(
        (int) ($config['mail']['port'] ?? 465),
        $smtpSecure ?? ($config['mail']['secure'] ?? true),
    );

    return $config;
}

function raahx_new_id(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(16));
}

function raahx_log_exception(Throwable $exception): void
{
    error_log(sprintf(
        '[RaahX API] %s in %s:%d',
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
    ));
}
