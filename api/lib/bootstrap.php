<?php
declare(strict_types=1);

require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Validation.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/../resources/services.php';
require_once __DIR__ . '/../resources/team.php';
require_once __DIR__ . '/../resources/blogs.php';
require_once __DIR__ . '/../resources/case_studies.php';

function raahx_env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
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
                'http://localhost:3000,http://127.0.0.1:3000',
            )),
        ), static fn (string $origin): bool => $origin !== '')),
        'admin_secret_env' => raahx_env('RAAHX_ADMIN_SECRET_ENV', 'ADMIN_SECRET'),
        'session' => [
            'cookie_name' => raahx_env('RAAHX_SESSION_COOKIE', 'raahx_php_session'),
            'ttl_seconds' => (int) raahx_env('RAAHX_SESSION_TTL', '28800'),
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
