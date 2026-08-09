<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/bootstrap.php';

$config = raahx_config();
ini_set('display_errors', '0');
ini_set('log_errors', '1');
Http::configureCors($config);
header('X-Content-Type-Options: nosniff');

try {
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    $segments = Http::pathSegments();
    if ($segments === []) {
        throw new ApiException(404, 'NOT_FOUND', 'API endpoint not found.');
    }

    $pdo = Database::connect($config);
    $body = in_array($method, ['POST', 'PUT'], true) ? Http::body() : [];
    $resource = $segments[0];

    if ($resource === 'auth') {
        api_dispatch_auth($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'services') {
        api_dispatch_services($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'team') {
        api_dispatch_team($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'blogs') {
        api_dispatch_blogs($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'case-studies') {
        api_dispatch_case_studies($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    throw new ApiException(404, 'NOT_FOUND', 'API endpoint not found.');
} catch (ApiException $exception) {
    Http::error($exception);
} catch (Throwable $exception) {
    raahx_log_exception($exception);
    Http::error(new ApiException(500, 'INTERNAL_ERROR', 'An unexpected server error occurred.'));
}

function api_dispatch_auth(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $action = $segments[0] ?? null;
    if (count($segments) !== 1) {
        throw new ApiException(404, 'NOT_FOUND', 'Authentication endpoint not found.');
    }

    if ($action === 'login' && $method === 'POST') {
        $secret = Validation::string($body, 'secret', true, 1000);
        Auth::login($pdo, $config, $secret ?? '');
        Http::json(['authenticated' => true]);
    }

    if ($action === 'session' && $method === 'GET') {
        Http::json(['authenticated' => Auth::isAuthenticated($pdo, $config)]);
    }

    if ($action === 'logout' && $method === 'POST') {
        Auth::logout($pdo, $config);
        Http::json(['authenticated' => false]);
    }

    if ($action === 'login') Http::methodNotAllowed(['POST']);
    if ($action === 'session') Http::methodNotAllowed(['GET']);
    if ($action === 'logout') Http::methodNotAllowed(['POST']);
    throw new ApiException(404, 'NOT_FOUND', 'Authentication endpoint not found.');
}

function api_dispatch_services(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $authenticatedWrite = static function () use ($pdo, $config): void {
        Auth::requireAuthenticated($pdo, $config);
    };

    if (count($segments) === 0) {
        if ($method === 'GET') Http::json(api_services_list($pdo));
        if ($method === 'POST') {
            $authenticatedWrite();
            Http::json(api_services_create($pdo, $body), 201);
        }
        Http::methodNotAllowed(['GET', 'POST']);
    }

    if (count($segments) === 1) {
        $id = Validation::id(['id' => $segments[0]]);
        if ($method === 'GET') Http::json(api_services_find($pdo, $id ?? ''));
        if ($method === 'PUT') {
            $authenticatedWrite();
            Http::json(api_services_update($pdo, $id ?? '', $body));
        }
        if ($method === 'DELETE') {
            $authenticatedWrite();
            api_services_delete($pdo, $id ?? '');
            Http::json(['deleted' => true]);
        }
        Http::methodNotAllowed(['GET', 'PUT', 'DELETE']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Service endpoint not found.');
}

function api_dispatch_team(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $authenticatedWrite = static function () use ($pdo, $config): void {
        Auth::requireAuthenticated($pdo, $config);
    };

    if (count($segments) === 0) {
        if ($method === 'GET') Http::json(api_team_list($pdo));
        if ($method === 'POST') {
            $authenticatedWrite();
            Http::json(api_team_create($pdo, $body), 201);
        }
        Http::methodNotAllowed(['GET', 'POST']);
    }

    if (count($segments) === 1) {
        $id = Validation::id(['id' => $segments[0]]);
        if ($method === 'GET') Http::json(api_team_find($pdo, $id ?? ''));
        if ($method === 'PUT') {
            $authenticatedWrite();
            Http::json(api_team_update($pdo, $id ?? '', $body));
        }
        if ($method === 'DELETE') {
            $authenticatedWrite();
            api_team_delete($pdo, $id ?? '');
            Http::json(['deleted' => true]);
        }
        Http::methodNotAllowed(['GET', 'PUT', 'DELETE']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Team endpoint not found.');
}

function api_dispatch_blogs(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $authenticatedWrite = static function () use ($pdo, $config): void {
        Auth::requireAuthenticated($pdo, $config);
    };

    if (count($segments) === 0) {
        if ($method === 'GET') Http::json(api_blogs_list($pdo));
        if ($method === 'POST') {
            $authenticatedWrite();
            Http::json(api_blogs_create($pdo, $body), 201);
        }
        Http::methodNotAllowed(['GET', 'POST']);
    }

    if (count($segments) === 2 && $segments[0] === 'slug') {
        if ($method !== 'GET') Http::methodNotAllowed(['GET']);
        Http::json(api_blogs_find_by_slug($pdo, Validation::slug($segments[1], 'slug')));
    }

    if (count($segments) === 1) {
        $id = Validation::id(['id' => $segments[0]]);
        if ($method === 'GET') Http::json(api_blogs_find($pdo, $id ?? ''));
        if ($method === 'PUT') {
            $authenticatedWrite();
            Http::json(api_blogs_update($pdo, $id ?? '', $body));
        }
        if ($method === 'DELETE') {
            $authenticatedWrite();
            api_blogs_delete($pdo, $id ?? '');
            Http::json(['deleted' => true]);
        }
        Http::methodNotAllowed(['GET', 'PUT', 'DELETE']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Blog endpoint not found.');
}

function api_dispatch_case_studies(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $authenticatedWrite = static function () use ($pdo, $config): void {
        Auth::requireAuthenticated($pdo, $config);
    };

    if (count($segments) === 0) {
        if ($method === 'GET') Http::json(api_case_studies_list($pdo));
        if ($method === 'POST') {
            $authenticatedWrite();
            Http::json(api_case_studies_create($pdo, $body), 201);
        }
        Http::methodNotAllowed(['GET', 'POST']);
    }

    if (count($segments) === 2 && $segments[0] === 'slug') {
        if ($method !== 'GET') Http::methodNotAllowed(['GET']);
        Http::json(api_case_studies_find_by_slug($pdo, Validation::slug($segments[1], 'slug')));
    }

    if (count($segments) === 1) {
        $id = Validation::id(['id' => $segments[0]]);
        if ($method === 'GET') Http::json(api_case_studies_find($pdo, $id ?? ''));
        if ($method === 'PUT') {
            $authenticatedWrite();
            Http::json(api_case_studies_update($pdo, $id ?? '', $body));
        }
        if ($method === 'DELETE') {
            $authenticatedWrite();
            api_case_studies_delete($pdo, $id ?? '');
            Http::json(['deleted' => true]);
        }
        Http::methodNotAllowed(['GET', 'PUT', 'DELETE']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Case Study endpoint not found.');
}
