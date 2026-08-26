<?php
declare(strict_types=1);

// Development-only router for PHP's built-in server. Production continues to
// use api/.htaccess and api/index.php through the existing same-origin /api path.
$path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if (preg_match('#^/api/(?:config|lib|resources)(?:/|$)#', $path)) {
    http_response_code(403);
    exit;
}

if ($path === '/api' || str_starts_with($path, '/api/')) {
    require __DIR__ . '/index.php';
    exit;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found\n";
