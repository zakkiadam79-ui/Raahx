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
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    $expectsJson = str_contains($contentType, 'application/json');
    $body = in_array($method, ['POST', 'PUT'], true) && $expectsJson ? Http::body() : [];
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

    if ($resource === 'creators') {
        api_dispatch_creators($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'creator-applications') {
        api_dispatch_creator_applications($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'creator-access') {
        api_dispatch_creator_access($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'creator-collaboration-requests') {
        api_dispatch_creator_collaboration_requests($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'creator-media') {
        api_dispatch_creator_media($pdo, $config, $method, array_slice($segments, 1));
    }

    if ($resource === 'subscribers') {
        api_dispatch_subscribers($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'notify-subscribers') {
        api_dispatch_notify_subscribers($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'proposals') {
        api_dispatch_proposals($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'blog-views') {
        api_dispatch_blog_views($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    if ($resource === 'migration') {
        api_dispatch_migration($pdo, $config, $method, array_slice($segments, 1), $body);
    }

    throw new ApiException(404, 'NOT_FOUND', 'API endpoint not found.');
} catch (ApiException $exception) {
    Http::error($exception);
} catch (Throwable $exception) {
    raahx_log_exception($exception);
    $creatorResources = ['creators', 'creator-applications', 'creator-access', 'creator-collaboration-requests', 'creator-media'];
    $sqlState = $exception instanceof PDOException
        ? (string) ($exception->errorInfo[0] ?? $exception->getCode())
        : '';
    if (in_array($resource ?? null, $creatorResources, true) && in_array($sqlState, ['42S02', '42S22'], true)) {
        Http::error(new ApiException(
            503,
            'CREATOR_SCHEMA_NOT_READY',
            'The Creator Network database schema is not available or does not match this API version.',
        ));
    }
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

function api_dispatch_creators(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    $authenticated = static function () use ($pdo, $config): void {
        Auth::requireAuthenticated($pdo, $config);
    };

    if (($segments[0] ?? null) === 'admin') {
        $authenticated();
        if (count($segments) === 1 && $method === 'GET') {
            Http::json(api_creators_list($pdo, $_GET, false));
        }
        if (count($segments) === 2 && $method === 'GET') {
            $id = Validation::id(['id' => $segments[1]]);
            Http::json(api_creators_find($pdo, $id ?? '', false));
        }
        if (count($segments) === 1 || count($segments) === 2) {
            Http::methodNotAllowed(['GET']);
        }
        throw new ApiException(404, 'NOT_FOUND', 'Creator admin endpoint not found.');
    }

    if (count($segments) === 0) {
        if ($method === 'GET') Http::json(api_creators_list($pdo, $_GET, true));
        if ($method === 'POST') {
            $authenticated();
            Http::json(api_creators_create($pdo, $body), 201);
        }
        Http::methodNotAllowed(['GET', 'POST']);
    }

    if (count($segments) === 1) {
        $id = Validation::id(['id' => $segments[0]]);
        if ($method === 'GET') Http::json(api_creators_find($pdo, $id ?? '', true));
        if ($method === 'PUT') {
            $authenticated();
            Http::json(api_creators_update($pdo, $id ?? '', $body));
        }
        if ($method === 'DELETE') {
            $authenticated();
            api_creators_delete($pdo, $id ?? '');
            Http::json(['deleted' => true]);
        }
        Http::methodNotAllowed(['GET', 'PUT', 'DELETE']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Creator endpoint not found.');
}

function api_dispatch_creator_applications(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if ($segments === [] && $method === 'POST') {
        Http::json(api_creator_applications_submit($pdo, $body, $config), 201);
    }
    if (($segments[0] ?? null) !== 'admin') {
        if ($segments === []) Http::methodNotAllowed(['POST']);
        throw new ApiException(404, 'NOT_FOUND', 'Creator application endpoint not found.');
    }
    Auth::requireAuthenticated($pdo, $config);
    if (count($segments) === 1 && $method === 'GET') {
        Http::json(api_creator_applications_list($pdo, $_GET));
    }
    if (count($segments) === 2 && $method === 'GET') {
        Http::json(api_creator_applications_find($pdo, Validation::id(['id'=>$segments[1]]) ?? ''));
    }
    if (count($segments) === 3 && $method === 'POST') {
        $id = Validation::id(['id'=>$segments[1]]) ?? '';
        if ($segments[2] === 'approve') Http::json(api_creator_applications_approve($pdo, $id, $body, $config));
        if ($segments[2] === 'reject') Http::json(api_creator_applications_reject($pdo, $id, $body));
    }
    if (count($segments) >= 1 && count($segments) <= 3) Http::methodNotAllowed(['GET', 'POST']);
    throw new ApiException(404, 'NOT_FOUND', 'Creator application admin endpoint not found.');
}

function api_dispatch_creator_access(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if ($segments === ['request'] && $method === 'POST') Http::json(api_creator_access_request($pdo, $body, $config));
    if ($segments === ['verify'] && $method === 'POST') Http::json(api_creator_access_verify($pdo, $body));
    if ($segments === ['profile'] && $method === 'PUT') Http::json(api_creator_access_update($pdo, $body));
    if (($segments[0] ?? null) === 'admin') {
        Auth::requireAuthenticated($pdo, $config);
        if (count($segments) === 3 && $segments[2] === 'revoke' && $method === 'POST') {
            Http::json(api_creator_access_revoke($pdo, Validation::id(['id'=>$segments[1]]) ?? ''));
        }
    }
    if (in_array($segments[0] ?? '', ['request','verify','profile','admin'], true)) Http::methodNotAllowed(['POST','PUT']);
    throw new ApiException(404, 'NOT_FOUND', 'Creator access endpoint not found.');
}

function api_dispatch_creator_collaboration_requests(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if ($segments === [] && $method === 'POST') {
        Http::json(api_creator_collaboration_create($pdo, $body, $config), 201);
    }
    if (($segments[0] ?? null) !== 'admin') {
        if ($segments === []) Http::methodNotAllowed(['POST']);
        throw new ApiException(404, 'NOT_FOUND', 'Creator collaboration endpoint not found.');
    }
    Auth::requireAuthenticated($pdo, $config);
    if (count($segments) === 1 && $method === 'GET') Http::json(api_creator_collaboration_list($pdo, $_GET));
    if (count($segments) === 2 && $method === 'GET') {
        $id = filter_var($segments[1], FILTER_VALIDATE_INT);
        if ($id === false) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid collaboration request ID.');
        Http::json(api_creator_collaboration_find($pdo, (int) $id));
    }
    if (count($segments) === 1 || count($segments) === 2) Http::methodNotAllowed(['GET']);
    throw new ApiException(404, 'NOT_FOUND', 'Creator collaboration admin endpoint not found.');
}

function api_dispatch_creator_media(PDO $pdo, array $config, string $method, array $segments): void
{
    if (count($segments) !== 1) throw new ApiException(404, 'NOT_FOUND', 'Creator media endpoint not found.');
    if ($method !== 'POST') Http::methodNotAllowed(['POST']);
    Http::json(api_creator_media_upload($pdo, $config, (string) $segments[0], $_POST), 201);
}

function api_dispatch_subscribers(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if ($segments === [] && $method === 'POST') {
        Http::json(api_subscribers_create($pdo, $body));
    }

    if ($segments === [] && $method === 'GET') {
        Auth::requireAuthenticated($pdo, $config);
        Http::json(api_subscribers_list($pdo));
    }

    if ($segments === []) {
        Http::methodNotAllowed(['GET', 'POST']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Subscriber endpoint not found.');
}

function api_dispatch_notify_subscribers(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    Auth::requireAuthenticated($pdo, $config);
    if ($segments !== []) {
        throw new ApiException(404, 'NOT_FOUND', 'Subscriber notification endpoint not found.');
    }
    if ($method !== 'POST') {
        Http::methodNotAllowed(['POST']);
    }

    Http::json(api_notify_subscribers($pdo, $config, $body));
}

function api_dispatch_proposals(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if ($segments === [] && $method === 'POST') {
        Http::json(api_proposals_create($pdo, $body, $config));
    }

    if ($segments === []) {
        Http::methodNotAllowed(['POST']);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Proposal endpoint not found.');
}

function api_dispatch_blog_views(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    if (count($segments) === 1 && $segments[0] === 'popular' && $method === 'GET') {
        Http::json(api_blog_views_popular($pdo, $_GET['limit'] ?? 3));
    }

    if (count($segments) === 1 && $method === 'POST') {
        Http::json(api_blog_views_increment($pdo, $segments[0]));
    }

    if ($segments !== []) {
        throw new ApiException(404, 'NOT_FOUND', 'Blog views endpoint not found.');
    }

    Http::methodNotAllowed(['GET', 'POST']);
}

function api_dispatch_migration(PDO $pdo, array $config, string $method, array $segments, array $body): void
{
    Auth::requireAuthenticated($pdo, $config);

    if (count($segments) !== 1) {
        throw new ApiException(404, 'NOT_FOUND', 'Migration endpoint not found.');
    }

    $action = $segments[0];
    if ($method !== 'POST') {
        Http::methodNotAllowed(['POST']);
    }

    if ($action === 'validate') {
        $validated = api_migration_validate($pdo, $body);
        Http::json([
            'dry_run' => true,
            'imported' => false,
            'counts' => $validated['counts'],
            'message' => 'Migration payload is valid and ready for review.',
        ]);
    }

    if ($action === 'import') {
        $dryRun = isset($_GET['dry_run']) && in_array((string) $_GET['dry_run'], ['1', 'true'], true);
        $result = api_migration_import($pdo, $body, $dryRun);
        Http::json($result);
    }

    throw new ApiException(404, 'NOT_FOUND', 'Migration endpoint not found.');
}
