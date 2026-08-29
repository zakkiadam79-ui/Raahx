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
    // Preferred: name of the server-only environment variable containing the Admin secret.
    'admin_secret_env' => 'ADMIN_SECRET',
    // Hostinger/shared-hosting fallback. Set the real value only in the ignored
    // config.php file; an available environment variable always takes priority.
    'admin_secret' => null,
    // Preferred: name of the server-only environment variable containing the CNIC encryption key.
    'creator_pii_key_env' => 'CREATOR_PII_KEY',
    // Hostinger/shared-hosting fallback: put the same minimum-32-character secret
    // directly in the ignored config.php file when server environment variables
    // are unavailable. Never add the real value to this example or to Git.
    'creator_pii_key' => null,
    'session' => [
        'cookie_name' => 'raahx_php_session',
        'ttl_seconds' => 28800,
    ],
    'app_url' => 'https://replace-with-raahx-domain.example',
    'mail' => [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'secure' => true,
        'user' => 'hello@raahx.com',
        // Set SMTP_PASS through the server environment, never in Git.
        'pass' => null,
        'from' => 'hello@raahx.com',
        'to' => 'hello@raahx.com',
    ],
];
