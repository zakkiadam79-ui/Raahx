<?php
declare(strict_types=1);

// Copy this file to config.php on the PHP host, or provide the same values
// through environment variables. Never commit the real configuration file.
return [
    'environment' => 'production',
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'replace-with-hostinger-database-name',
        'user' => 'replace-with-hostinger-database-user',
        'password' => 'replace-with-hostinger-database-password',
    ],
    'allowed_origins' => [
        'https://replace-with-raahx-domain.example',
    ],
    'admin_secret_env' => 'ADMIN_SECRET',
    'session' => [
        'cookie_name' => 'raahx_php_session',
        'ttl_seconds' => 28800,
    ],
];
