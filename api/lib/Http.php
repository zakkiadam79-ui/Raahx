<?php
declare(strict_types=1);

final class ApiException extends RuntimeException
{
    public int $status;
    public string $errorCode;

    public function __construct(
        int $status,
        string $errorCode,
        string $message,
        ?Throwable $previous = null,
    ) {
        $this->status = $status;
        $this->errorCode = $errorCode;
        parent::__construct($message, 0, $previous);
    }
}

final class Http
{
    public static function configureCors(array $config): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = $config['allowed_origins'] ?? [];

        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
        header('Content-Type: application/json; charset=utf-8');
    }

    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode(
            ['success' => true, 'data' => $data],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
        );
        exit;
    }

    public static function error(ApiException $exception): void
    {
        http_response_code($exception->status);
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => $exception->errorCode,
                'message' => $exception->getMessage(),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        try {
            $body = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new ApiException(400, 'MALFORMED_JSON', 'Request body must contain valid JSON.');
        }

        if (!is_array($body)) {
            throw new ApiException(400, 'MALFORMED_JSON', 'Request body must be a JSON object.');
        }

        return $body;
    }

    public static function pathSegments(): array
    {
        $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $segments = array_values(array_filter(explode('/', trim($path, '/')), static fn (string $value): bool => $value !== ''));

        if (($segments[0] ?? null) === 'api') {
            array_shift($segments);
        }
        if (($segments[0] ?? null) === 'index.php') {
            array_shift($segments);
        }

        return array_map(static fn (string $segment): string => rawurldecode($segment), $segments);
    }

    public static function methodNotAllowed(array $allowedMethods): void
    {
        header('Allow: ' . implode(', ', $allowedMethods));
        throw new ApiException(405, 'METHOD_NOT_ALLOWED', 'This HTTP method is not supported for this endpoint.');
    }
}
